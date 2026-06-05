import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { prisma } from '@swift/db';
import type { CreateWorkspaceDto, UpdateWorkspaceDto } from '@swift/types';

@Injectable()
export class WorkspaceService {
  async create(userId: string, dto: CreateWorkspaceDto): Promise<{ id: string; name: string; slug: string }> {
    const existing = await prisma.workspace.findUnique({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException('Workspace с таким slug уже существует');
    }

    const workspace = await prisma.$transaction(async (tx) => {
      const ws = await tx.workspace.create({
        data: { name: dto.name, slug: dto.slug, ownerId: userId, },
      });
      await tx.member.create({
        data: { userId, workspaceId: ws.id, role: 'OWNER' },
      });
      return ws;
    });

    return { id: workspace.id, name: workspace.name, slug: workspace.slug };
  }

  async findUserWorkspaces(userId: string): Promise<Array<{ id: string; name: string; slug: string; role: string }>> {
    const members = await prisma.member.findMany({
      where: { userId },
      include: { workspace: true },
    });
    return members.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      role: m.role,
    }));
  }

  async findOne(workspaceId: string): Promise<{ id: string; name: string; slug: string }> {
    const ws = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!ws) {
      throw new NotFoundException('Workspace не найден');
    }
    return { id: ws.id, name: ws.name, slug: ws.slug };
  }

  async update(
    workspaceId: string,
    dto: UpdateWorkspaceDto,
  ): Promise<{ id: string; name: string; slug: string }> {
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
  async remove(workspaceId: string): Promise<void> {
    await prisma.workspace.delete({ where: { id: workspaceId } });
  }
}
