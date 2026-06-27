'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Card } from '@/components/board/card';
import { useBoard } from '@/lib/board-store';
import type { ColumnData } from '@/lib/board-types';

export function Column({ column }: { column: ColumnData }) {
  const addCard = useBoard((s) => s.addCard);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');

  // Droppable-зона колонки. data.type='column' — обработчик отличает дроп
  // на колонку от дропа на карточку.
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column', columnId: column.id },
  });

  const onAdd = async (): Promise<void> => {
    const t = title.trim();
    if (!t) {
      return;
    }
    await addCard(column.id, t);
    setTitle('');
    setAdding(false);
  };

  const cardIds = column.cards.map((c) => c.id);

  return (
    <div className="flex max-h-full w-72 flex-shrink-0 flex-col rounded-glass bg-surface/25 p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-medium text-ink">{column.name}</h3>
        <span className="rounded-full bg-surface/50 px-2 py-0.5 text-xs text-ink-muted">
          {column.cards.length}
        </span>
      </div>

      {/* Зона карточек — droppable, растягивается на всю доступную высоту
          (flex-1 + min-h), чтобы в ПУСТУЮ колонку тоже можно было бросить. */}
      <div
        ref={setNodeRef}
        className={`flex min-h-[60px] flex-1 flex-col gap-2 overflow-y-auto rounded-glass p-1 transition ${
          isOver ? 'bg-accent/10 ring-1 ring-accent/30' : ''
        }`}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </SortableContext>
      </div>

      {adding ? (
        <div className="mt-2">
          <textarea
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void onAdd();
              }
              if (e.key === 'Escape') setAdding(false);
            }}
            placeholder="Заголовок карточки"
            rows={2}
            className="glass-strong w-full resize-none rounded-glass p-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <div className="mt-1.5 flex gap-2">
            <button
              onClick={() => void onAdd()}
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
          className="mt-2 flex items-center gap-1.5 rounded-glass px-2 py-1.5 text-sm text-ink-muted hover:bg-surface/40 hover:text-ink"
        >
          <Plus size={15} />
          Добавить карточку
        </button>
      )}
    </div>
  );
}
