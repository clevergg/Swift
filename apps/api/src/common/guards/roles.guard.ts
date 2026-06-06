import {
  Injectable,
  CanActivate,
  type ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { prisma, Role } from '@swift/db';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { hasRequiredRole } from '../enums/role-hierarchy';

/**
 * RolesGuard — проверяет роль юзера в workspace.
 *
 * Расширен: workspaceId определяется ГИБКО, в зависимости от того, что есть
 * в URL. Это нужно, потому что ресурсы вложены на разную глубину:
 *  - /workspaces/:workspaceId/...   → workspaceId прямо в URL
 *  - /boards/:boardId/...           → workspaceId через board
 *  - /columns/:columnId/...         → через column → board
 *  - /cards/:cardId/...             → через card → column → board
 *
 * Guard сам поднимается по цепочке принадлежности до workspace. Так короткие
 * URL ресурсов работают с RBAC без дублирования всей иерархии в пути.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.getAllAndOverride<Role | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Нет @Roles — проверка роли не требуется.
    if (!requiredRole) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: { id: string };
      params: Record<string, string>;
    }>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Требуется аутентификация');
    }

    // Определяем workspaceId из того, что есть в URL.
    const workspaceId = await this.resolveWorkspaceId(request.params);
    if (!workspaceId) {
      throw new BadRequestException('Не удалось определить workspace для проверки прав');
    }

    // Находим роль юзера в этом workspace.
    const member = await prisma.member.findUnique({
      where: { userId_workspaceId: { userId: user.id, workspaceId } },
    });
    if (!member) {
      throw new ForbiddenException('Вы не состоите в этом рабочем пространстве');
    }
    if (!hasRequiredRole(member.role, requiredRole)) {
      throw new ForbiddenException(`Недостаточно прав. Требуется роль ${requiredRole} или выше`);
    }

    // Кладём workspaceId и роль в request — пригодятся контроллеру/сервису.
    (request as { workspaceId?: string; memberRole?: Role }).workspaceId = workspaceId;
    (request as { workspaceId?: string; memberRole?: Role }).memberRole = member.role;

    return true;
  }

  /**
   * Определяет workspaceId из параметров URL, поднимаясь по цепочке ресурсов.
   * Проверяет параметры от самого конкретного (cardId) к общему (workspaceId).
   */
  private async resolveWorkspaceId(params: Record<string, string>): Promise<string | null> {
    // Прямой случай — workspaceId в URL.
    if (params['workspaceId']) {
      return params['workspaceId'];
    }

    // boardId → workspaceId.
    if (params['boardId']) {
      const board = await prisma.board.findUnique({
        where: { id: params['boardId'] },
        select: { workspaceId: true },
      });
      return board?.workspaceId ?? null;
    }

    // columnId → board → workspaceId.
    if (params['columnId']) {
      const column = await prisma.column.findUnique({
        where: { id: params['columnId'] },
        select: { board: { select: { workspaceId: true } } },
      });
      return column?.board.workspaceId ?? null;
    }

    // cardId → column → board → workspaceId.
    if (params['cardId']) {
      const card = await prisma.card.findUnique({
        where: { id: params['cardId'] },
        select: { column: { select: { board: { select: { workspaceId: true } } } } },
      });
      return card?.column.board.workspaceId ?? null;
    }

    return null;
  }
}
