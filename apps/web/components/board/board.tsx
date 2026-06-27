'use client';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, CollisionDetection } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Card } from '@/components/board/card';
import { Column } from '@/components/board/column';
import { useBoard } from '@/lib/board-store';
import type { BoardData, CardData } from '@/lib/board-types';

export function Board({ board }: { board: BoardData }) {
  const addColumn = useBoard((s) => s.addColumn);
  const moveCardLocal = useBoard((s) => s.moveCardLocal);
  const commitMove = useBoard((s) => s.commitMove);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [activeCard, setActiveCard] = useState<CardData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // Комбинированный детектор коллизий для канбана:
  // сначала pointerWithin (что прямо под курсором — точнее всего для дропа
  // в пустые колонки), фолбэк на rectIntersection (пересечение прямоугольников).
  // closestCorners плохо работал: всегда тянул в первую колонку.
  const collisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    return rectIntersection(args);
  };

  const onAddColumn = async (): Promise<void> => {
    const n = name.trim();
    if (!n) {
      return;
    }
    await addColumn(n);
    setName('');
    setAdding(false);
  };

  const findCardById = (id: string): CardData | null => {
    for (const col of board.columns) {
      const card = col.cards.find((c) => c.id === id);
      if (card) {
        return card;
      }
    }
    return null;
  };

  const onDragStart = (event: DragStartEvent): void => {
    const card = findCardById(String(event.active.id));
    setActiveCard(card);
  };

  const onDragEnd = (event: DragEndEvent): void => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) {
      return;
    }

    const cardId = String(active.id);
    const overId = String(over.id);

    // over может быть карточкой ('card') или колонкой ('column').
    const overData = over.data.current as
      | { type: string; columnId: string }
      | undefined;

    let targetColumnId: string;
    let targetIndex: number;

    if (overData?.type === 'column') {
      // Дроп на колонку (в т.ч. пустую) — в конец её карточек.
      targetColumnId = overData.columnId;
      const col = board.columns.find((c) => c.id === targetColumnId);
      targetIndex = col ? col.cards.length : 0;
    } else if (overData?.type === 'card') {
      // Дроп на карточку — встаём на её позицию в её колонке.
      targetColumnId = overData.columnId;
      const col = board.columns.find((c) => c.id === targetColumnId);
      if (!col) {
        return;
      }
      targetIndex = col.cards.findIndex((card) => card.id === overId);
      if (targetIndex === -1) {
        targetIndex = col.cards.length;
      }
    } else {
      return;
    }

    moveCardLocal(cardId, targetColumnId, targetIndex);
    void commitMove(cardId);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto p-6">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} />
        ))}

        <div className="w-72 flex-shrink-0">
          {adding ? (
            <div className="rounded-glass bg-surface/25 p-3">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void onAddColumn();
                  if (e.key === 'Escape') setAdding(false);
                }}
                placeholder="Название колонки"
                className="glass-strong w-full rounded-glass px-3 py-2 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              <div className="mt-1.5 flex gap-2">
                <button
                  onClick={() => void onAddColumn()}
                  className="rounded-glass bg-accent/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-accent"
                >
                  Добавить
                </button>
                <button
                  onClick={() => setAdding(false)}
                  className="rounded-glass px-3 py-1.5 text-xs text-ink-muted hover:bg-surface/50"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="glass flex w-full items-center gap-2 rounded-glass px-4 py-3 text-sm text-ink-muted hover:bg-surface/40 hover:text-ink"
            >
              <Plus size={16} />
              Добавить колонку
            </button>
          )}
        </div>
      </div>

      <DragOverlay>{activeCard ? <Card card={activeCard} /> : null}</DragOverlay>
    </DndContext>
  );
}
