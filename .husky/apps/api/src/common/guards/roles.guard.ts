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
 * RolesGuard — проверяет, есть ли у юзера нужная роль в workspace.
 *
 * Запускается ПОСЛЕ JwtAuthGuard (тот уже положил юзера в request.user).
 * Шаги:
 *  1. Прочитать требуемую роль из метаданных (@Roles(...) на эндпоинте).
 *  2. Достать workspaceId из URL (request.params.workspaceId).
 *  3. Найти роль юзера в этом workspace (запись Member).
 *  4. Сравнить с требуемой по иерархии. Не хватает → 403.
 *
 * CanActivate — интерфейс guard, метод canActivate возвращает true (пускаем)
 * или кидает исключение (отказ).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  // Reflector — инструмент NestJS для чтения метаданных, записанных декоратором.
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Читаем требуемую роль из метаданных обработчика (что задал @Roles).
    const requiredRole = this.reflector.getAllAndOverride<Role | undefined>(ROLES_KEY, [
      context.getHandler(), // метод контроллера
      context.getClass(), // сам контроллер (если @Roles на уровне класса)
    ]);

    // Если @Roles не задан — эндпоинт не требует конкретной роли, пропускаем.
    // (он всё равно защищён JwtAuthGuard, если тот навешан — достаточно быть залогиненным)
    if (!requiredRole) {
      return true;
    }

    // Достаём запрос и юзера (его положил JwtAuthGuard).
    const request = context.switchToHttp().getRequest<{
      user?: { id: string };
      params: Record<string, string>;
    }>();
    const user = request.user;

    // Юзера нет — значит RolesGuard навесили без JwtAuthGuard. Это ошибка
    // конфигурации: проверка роли без аутентификации бессмысленна.
    if (!user) {
      throw new ForbiddenException('Требуется аутентификация');
    }

    // 2. Достаём workspaceId из URL (/workspaces/:workspaceId/...).
    const workspaceId = request.params['workspaceId'];
    if (!workspaceId) {
      // Эндпоинт с @Roles, но без workspaceId в URL — ошибка проектирования.
      throw new BadRequestException('workspaceId обязателен в URL для проверки прав');
    }

    // 3. Находим роль юзера в этом workspace (запись Member).
    const member = await prisma.member.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });

    // Юзер не состоит в workspace — нет доступа.
    if (!member) {
      throw new ForbiddenException('Вы не состоите в этом рабочем пространстве');
    }

    // 4. Сравниваем роль по иерархии.
    if (!hasRequiredRole(member.role, requiredRole)) {
      throw new ForbiddenException(
        `Недостаточно прав. Требуется роль ${requiredRole} или выше`,
      );
    }

    return true;
  }
}
