'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { CardData, Priority } from '@/lib/board-types';

const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: 'bg-slate-400',
  MEDIUM: 'bg-sky-400',
  HIGH: 'bg-amber-400',
  URGENT: 'bg-red-400',
};

export function Card({ card }: { card: CardData }) {
  // useSortable делает карточку перетаскиваемой и сортируемой.
  // data: { type, columnId } — нужно обработчику drag для вычисления цели.
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'card', columnId: card.columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="glass-strong cursor-grab rounded-glass p-3 transition hover:bg-surface/60 active:cursor-grabbing"
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${PRIORITY_COLORS[card.priority]}`}
        />
        <span className="text-sm text-ink">{card.title}</span>
      </div>
      {card.description ? (
        <p className="line-clamp-2 text-xs text-ink-muted">{card.description}</p>
      ) : null}
    </div>
  );
}
