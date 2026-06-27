'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';

import { Board } from '@/components/board/board';
import { FullPageLoader } from '@/components/ui/full-page-loader';
import { useBoard } from '@/lib/board-store';

export default function BoardPage() {
  const params = useParams();
  const boardId = typeof params['boardId'] === 'string' ? params['boardId'] : '';

  const board = useBoard((s) => s.board);
  const loading = useBoard((s) => s.loading);
  const error = useBoard((s) => s.error);
  const loadBoard = useBoard((s) => s.loadBoard);
  const reset = useBoard((s) => s.reset);

  useEffect(() => {
    if (boardId) {
      void loadBoard(boardId);
    }
    // Сброс при уходе со страницы — чтобы не мелькал старый контент.
    return () => reset();
  }, [boardId, loadBoard, reset]);

  if (loading && !board) {
    return <FullPageLoader />;
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-ink-muted">{error}</p>
      </div>
    );
  }

  if (!board) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-glass-border px-6 py-4">
        <h1 className="text-lg font-medium text-ink">{board.name}</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <Board board={board} />
      </div>
    </div>
  );
}