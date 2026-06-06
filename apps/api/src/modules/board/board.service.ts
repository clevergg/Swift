import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@swift/db';
import type { CreateBoardDto, UpdateBoardDto } from '@swift/types';

import { calculatePosition } from '../board/position.helper';

@Injectable()
export class BoardService {
  // Список досок workspace.
  async findByWorkspace(workspaceId: string): Promise<Array<{ id: string; name: string }>> {
    const boards = await prisma.board.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    });
    return boards.map((b) => ({ id: b.id, name: b.name }));
  }

  // Создать доску в workspace.
  async create(workspaceId: string, dto: CreateBoardDto): Promise<{ id: string; name: string }> {
  const last = await prisma.board.findFirst({
    where: { workspaceId },
    orderBy: { position: 'desc' },
  });
  const position = calculatePosition(last?.position ?? null, null) ?? 1000;

  const board = await prisma.board.create({
    data: { name: dto.name, workspaceId, position },
  });
  return { id: board.id, name: board.name };
}

  // Получить доску с колонками и карточками (для отрисовки доски).
  async findOne(boardId: string): Promise<unknown> {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            cards: { orderBy: { position: 'asc' } },
          },
        },
      },
    });
    if (!board) {
      throw new NotFoundException('Доска не найдена');
    }
    return board;
  }

  async update(boardId: string, dto: UpdateBoardDto): Promise<{ id: string; name: string }> {
    const board = await prisma.board.update({ where: { id: boardId }, data: dto });
    return { id: board.id, name: board.name };
  }

  async remove(boardId: string): Promise<void> {
    // Каскады удалят колонки и карточки (onDelete: Cascade в схеме).
    await prisma.board.delete({ where: { id: boardId } });
  }
}
