'use client';

import { create } from 'zustand';

import { boardApi } from '@/lib/board-api';
import type { BoardData, CardData, ColumnData } from '@/lib/board-types';

interface BoardState {
  board: BoardData | null;
  loading: boolean;
  error: string | null;

  loadBoard: (boardId: string) => Promise<void>;
  addColumn: (name: string) => Promise<void>;
  addCard: (columnId: string, title: string) => Promise<void>;
  moveCardLocal: (cardId: string, toColumnId: string, toIndex: number) => void;
  commitMove: (cardId: string) => Promise<void>;
  reset: () => void;
}

function findCard(
  board: BoardData,
  cardId: string,
): { card: CardData; columnId: string; index: number } | null {
  for (const col of board.columns) {
    const index = col.cards.findIndex((c) => c.id === cardId);
    if (index !== -1) {
      return { card: col.cards[index]!, columnId: col.id, index };
    }
  }
  return null;
}

export const useBoard = create<BoardState>((set, get) => ({
  board: null,
  loading: false,
  error: null,

  loadBoard: async (boardId) => {
    set({ loading: true, error: null });
    try {
      const board = await boardApi.getBoard(boardId);
      set({ board, loading: false });
    } catch {
      set({ error: 'Не удалось загрузить доску', loading: false });
    }
  },

  addColumn: async (name) => {
    const board = get().board;
    if (!board) {
      return;
    }
    try {
      const column = await boardApi.createColumn(board.id, name);
      const newColumn: ColumnData = { ...column, cards: column.cards ?? [] };
      set({ board: { ...board, columns: [...board.columns, newColumn] } });
    } catch {
      set({ error: 'Не удалось создать колонку' });
    }
  },

  addCard: async (columnId, title) => {
    const board = get().board;
    if (!board) {
      return;
    }
    try {
      const card = await boardApi.createCard(columnId, { title });
      set({
        board: {
          ...board,
          columns: board.columns.map((col) =>
            col.id === columnId ? { ...col, cards: [...col.cards, card] } : col,
          ),
        },
      });
    } catch {
      set({ error: 'Не удалось создать карточку' });
    }
  },

  moveCardLocal: (cardId, toColumnId, toIndex) => {
    const board = get().board;
    if (!board) {
      return;
    }
    const found = findCard(board, cardId);
    if (!found) {
      return;
    }
    const { card, columnId: fromColumnId, index: fromIndex } = found;

    if (fromColumnId === toColumnId && fromIndex === toIndex) {
      return;
    }

    const columns = board.columns.map((col) => {
      if (col.id === fromColumnId) {
        return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
      }
      return col;
    });

    const targetColumns = columns.map((col) => {
      if (col.id === toColumnId) {
        const newCards = [...col.cards];
        const insertAt =
          fromColumnId === toColumnId && fromIndex < toIndex ? toIndex - 1 : toIndex;
        newCards.splice(insertAt, 0, { ...card, columnId: toColumnId });
        return { ...col, cards: newCards };
      }
      return col;
    });

    set({ board: { ...board, columns: targetColumns } });
  },

  commitMove: async (cardId) => {
    const board = get().board;
    if (!board) {
      return;
    }
    const found = findCard(board, cardId);
    if (!found) {
      return;
    }
    const { columnId, index } = found;
    const column = board.columns.find((c) => c.id === columnId);
    if (!column) {
      return;
    }

    const beforeCard = index > 0 ? column.cards[index - 1] : null;
    const afterCard = index < column.cards.length - 1 ? column.cards[index + 1] : null;

    try {
      await boardApi.moveCard(cardId, {
        targetColumnId: columnId,
        beforeCardId: beforeCard?.id ?? null,
        afterCardId: afterCard?.id ?? null,
      });
    } catch {
      set({ error: 'Не удалось переместить карточку' });
      await get().loadBoard(board.id);
    }
  },

  reset: () => {
    set({ board: null, loading: false, error: null });
  },
}));