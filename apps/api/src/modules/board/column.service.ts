import { Injectable } from '@nestjs/common';
import { prisma } from '@swift/db';
import type { CreateColumnDto, UpdateColumnDto } from '@swift/types';

import { calculatePosition } from './position.helper';

@Injectable()
export class ColumnService {
  // Создать колонку в доске. Позиция - в конец (после последней колонки).
  async create(boardId: string, dto: CreateColumnDto): Promise<{ id: string; name: string; position: number }> {
    // Находим последнюю колонку доски, чтобы поставить новую после неё.
    const last = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
    });
    // Позиция: после последней (или первая, если колонок нет).
    const position = calculatePosition(last?.position ?? null, null) ?? 1000;

    const column = await prisma.column.create({
      data: { name: dto.name, boardId, position },
    });
    return { id: column.id, name: column.name, position: column.position };
  }

  async update(columnId: string, dto: UpdateColumnDto): Promise<{ id: string; name: string }> {
    const column = await prisma.column.update({ where: { id: columnId }, data: dto });
    return { id: column.id, name: column.name };
  }

  async remove(columnId: string): Promise<void> {
    // Каскад удалит карточки колонки.
    await prisma.column.delete({ where: { id: columnId } });
  }
}
