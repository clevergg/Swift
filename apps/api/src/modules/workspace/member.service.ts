import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { prisma, Role } from '@swift/db';

import { hasRequiredRole } from '../../common/enums/role-hierarchy';

@Injectable()
export class MemberService {
  // ── Список участников workspace ──
  async findWorkspaceMembers(
    workspaceId: string,
  ): Promise<Array<{ userId: string; email: string; name: string; role: string }>> {
    const members = await prisma.member.findMany({
      where: { workspaceId },
      include: { user: true },
    });
    return members.map((m) => ({
      userId: m.user.id,
      email: m.user.email,
      name: m.user.name,
      role: m.role,
    }));
  }

  // ── Добавить участника по email ──
  // actorRole — роль того, кто добавляет (для проверки "не выше своей").
  async addMember(
    workspaceId: string,
    actorRole: Role,
    email: string,
    role: Role,
  ): Promise<{ userId: string; email: string; role: string }> {
    // Нельзя назначить роль выше собственной (ADMIN не может создать OWNER).
    if (!hasRequiredRole(actorRole, role)) {
      throw new ForbiddenException('Нельзя назначить роль выше собственной');
    }

    // Находим юзера по email (должен быть зарегистрирован — это базовое
    // добавление; приглашения незарегистрированных будут в отдельной задаче).
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('Пользователь с таким email не найден');
    }

    // Проверяем, не участник ли уже.
    const existing = await prisma.member.findUnique({
      where: { userId_workspaceId: { userId: user.id, workspaceId } },
    });
    if (existing) {
      throw new ConflictException('Пользователь уже участник этого workspace');
    }

    const member = await prisma.member.create({
      data: { userId: user.id, workspaceId, role },
    });
    return { userId: user.id, email: user.email, role: member.role };
  }

  // ── Сменить роль участника ──
  // Тут собраны правила безопасности — самая важная логика модуля.
  async updateRole(
    workspaceId: string,
    actorUserId: string,
    actorRole: Role,
    targetUserId: string,
    newRole: Role,
  ): Promise<{ userId: string; role: string }> {
    // Находим целевого участника.
    const target = await prisma.member.findUnique({
      where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
    });
    if (!target) {
      throw new NotFoundException('Участник не найден');
    }

    // Правило 1: нельзя назначить роль выше своей.
    if (!hasRequiredRole(actorRole, newRole)) {
      throw new ForbiddenException('Нельзя назначить роль выше собственной');
    }

    // Правило 2: нельзя трогать того, кто равен или старше тебя (кроме себя).
    // ADMIN не может менять роль другого ADMIN или OWNER.
    if (target.userId !== actorUserId && hasRequiredRole(target.role, actorRole)) {
      throw new ForbiddenException('Недостаточно прав для изменения роли этого участника');
    }

    // Правило 3: нельзя понизить последнего OWNER (workspace останется без владельца).
    if (target.role === 'OWNER' && newRole !== 'OWNER') {
      const ownerCount = await prisma.member.count({
        where: { workspaceId, role: 'OWNER' },
      });
      if (ownerCount <= 1) {
        throw new BadRequestException('Нельзя понизить последнего владельца workspace');
      }
    }

    const updated = await prisma.member.update({
      where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
      data: { role: newRole },
    });
    return { userId: targetUserId, role: updated.role };
  }

  // ── Удалить участника ──
  async removeMember(
    workspaceId: string,
    actorUserId: string,
    actorRole: Role,
    targetUserId: string,
  ): Promise<void> {
    const target = await prisma.member.findUnique({
      where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
    });
    if (!target) {
      throw new NotFoundException('Участник не найден');
    }

    // Нельзя удалить того, кто равен/старше (кроме самоудаления — выйти можно).
    if (target.userId !== actorUserId && hasRequiredRole(target.role, actorRole)) {
      throw new ForbiddenException('Недостаточно прав для удаления этого участника');
    }

    // Нельзя удалить последнего OWNER.
    if (target.role === 'OWNER') {
      const ownerCount = await prisma.member.count({
        where: { workspaceId, role: 'OWNER' },
      });
      if (ownerCount <= 1) {
        throw new BadRequestException('Нельзя удалить последнего владельца workspace');
      }
    }

    await prisma.member.delete({
      where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
    });
  }
}
