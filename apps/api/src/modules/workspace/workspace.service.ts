import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { prisma } from '@swift/db';
import type { CreateWorkspaceDto, UpdateWorkspaceDto } from '@swift/types';

@Injectable()
export class WorkspaceService {
  // ── Создание workspace ──
  // Создатель автоматически становится OWNER. Workspace и Member создаются
  // АТОМАРНО в транзакции: либо оба, либо ни одного. Иначе при сбое между
  // ними получили бы workspace без владельца (сирота, к которому нет доступа).
  async create(userId: string, dto: CreateWorkspaceDto): Promise<{ id: string; name: string; slug: string }> {
    // Проверяем уникальность slug заранее (понятная ошибка вместо ошибки БД).
    const existing = await prisma.workspace.findUnique({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException('Workspace с таким slug уже существует');
    }

    // prisma.$transaction — обе операции в одной транзакции.
    const workspace = await prisma.$transaction(async (tx) => {
      const ws = await tx.workspace.create({
        data: { name: dto.name, slug: dto.slug, ownerId: userId,  },
      });
      // Создатель — OWNER.
      await tx.member.create({
        data: { userId, workspaceId: ws.id, role: 'OWNER' },
      });
      return ws;
    });

    return { id: workspace.id, name: workspace.name, slug: workspace.slug };
  }

  // ── Список workspace юзера ──
  // Возвращаем только те, где юзер — участник (есть запись Member).
  async findUserWorkspaces(userId: string): Promise<Array<{ id: string; name: string; slug: string; role: string }>> {
    const members = await prisma.member.findMany({
      where: { userId },
      include: { workspace: true },
    });
    // Отдаём workspace + роль юзера в нём.
    return members.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      role: m.role,
    }));
  }

  // ── Получить один workspace ──
  // Доступ проверяет RolesGuard (участник). Тут просто отдаём данные.
  async findOne(workspaceId: string): Promise<{ id: string; name: string; slug: string }> {
    const ws = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!ws) {
      throw new NotFoundException('Workspace не найден');
    }
    return { id: ws.id, name: ws.name, slug: ws.slug };
  }

  // ── Обновление ──
  async update(
    workspaceId: string,
    dto: UpdateWorkspaceDto,
  ): Promise<{ id: string; name: string; slug: string }> {
    // Если меняют slug — проверяем, что новый не занят другим workspace.
    if (dto.slug) {
      const existing = await prisma.workspace.findUnique({ where: { slug: dto.slug } });
      if (existing && existing.id !== workspaceId) {
        throw new ConflictException('Workspace с таким slug уже существует');
      }
    }

    const ws = await prisma.workspace.update({
      where: { id: workspaceId },
      data: dto,
    });
    return { id: ws.id, name: ws.name, slug: ws.slug };
  }

  // ── Удаление ──
  // Доступ (только OWNER) проверяет RolesGuard. Каскады в схеме удалят
  // связанные members, boards и т.д. (onDelete: Cascade).
  async remove(workspaceId: string): Promise<void> {
    await prisma.workspace.delete({ where: { id: workspaceId } });
  }
}
