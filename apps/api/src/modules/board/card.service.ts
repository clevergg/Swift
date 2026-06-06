import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@swift/db';
import type { CreateCardDto, UpdateCardDto, MoveCardDto } from '@swift/types';

import { calculatePosition, rebalancePositions } from './position.helper';

@Injectable()
export class CardService {
  // Создать карточку в колонке. Позиция - в конец колонки.
  async create(columnId: string, createdById: string, dto: CreateCardDto): Promise<unknown> {
    const last = await prisma.card.findFirst({
      where: { columnId },
      orderBy: { position: 'desc' },
    });
    const position = calculatePosition(last?.position ?? null, null) ?? 1000;

    return prisma.card.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? 'MEDIUM',
        assigneeId: dto.assigneeId,
        columnId,
        createdById,
        position,
      },
    });
  }

  async findOne(cardId: string): Promise<unknown> {
    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException('Карточка не найдена');
    }
    return card;
  }

  async update(cardId: string, dto: UpdateCardDto): Promise<unknown> {
    return prisma.card.update({ where: { id: cardId }, data: dto });
  }

  async remove(cardId: string): Promise<void> {
    await prisma.card.delete({ where: { id: cardId } });
  }

  // Перемещение карточки (drag-and-drop)
  // Сердце канбана. Карточку переносят в targetColumnId между соседями
  // beforeCardId и afterCardId. Вычисляем новую позицию как среднее.
  // Если промежуток схлопнулся - ребаланс колонки.
  async move(cardId: string, dto: MoveCardDto): Promise<unknown> {
    // Проверяем, что карточка существует.
    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException('Карточка не найдена');
    }

    // Достаём позиции соседей (если указаны).
    const before = dto.beforeCardId
      ? await prisma.card.findUnique({ where: { id: dto.beforeCardId } })
      : null;
    const after = dto.afterCardId
      ? await prisma.card.findUnique({ where: { id: dto.afterCardId } })
      : null;

    // Вычисляем новую позицию между соседями.
    const newPosition = calculatePosition(before?.position ?? null, after?.position ?? null);

    if (newPosition !== null) {
      // Обычный случай: промежуток достаточный, одно обновление.
      return prisma.card.update({
        where: { id: cardId },
        data: { position: newPosition, columnId: dto.targetColumnId },
      });
    }

    // Промежуток схлопнулся - ребаланс целевой колонки.
    // Достаём все карточки целевой колонки в порядке позиций, вставляем нашу
    // в нужное место, раздаём позиции заново.
    return this.rebalanceAndMove(cardId, dto);
  }

  // Ребаланс: пересчитать позиции всей целевой колонки с учётом нового места карточки.
  private async rebalanceAndMove(cardId: string, dto: MoveCardDto): Promise<unknown> {
    // Все карточки целевой колонки (кроме перемещаемой), упорядоченные.
    const cards = await prisma.card.findMany({
      where: { columnId: dto.targetColumnId, id: { not: cardId } },
      orderBy: { position: 'asc' },
    });

    // Строим новый порядок id: вставляем cardId после beforeCardId.
    const orderedIds: string[] = [];
    let inserted = false;
    for (const c of cards) {
      if (dto.afterCardId && c.id === dto.afterCardId && !inserted) {
        orderedIds.push(cardId);
        inserted = true;
      }
      orderedIds.push(c.id);
      if (dto.beforeCardId && c.id === dto.beforeCardId && !inserted) {
        orderedIds.push(cardId);
        inserted = true;
      }
    }
    // Если не вставили (край колонки) - в конец.
    if (!inserted) {
      orderedIds.push(cardId);
    }

    // Раздаём позиции заново.
    const positions = rebalancePositions(orderedIds);

    // Обновляем все карточки в транзакции (атомарно).
    await prisma.$transaction(
      orderedIds.map((id) =>
        prisma.card.update({
          where: { id },
          data: {
            position: positions.get(id) ?? 1000,
            // перемещаемой меняем ещё и колонку
            ...(id === cardId ? { columnId: dto.targetColumnId } : {}),
          },
        }),
      ),
    );

    return prisma.card.findUnique({ where: { id: cardId } });
  }
}
