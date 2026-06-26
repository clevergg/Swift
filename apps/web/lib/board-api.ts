import { api } from '@/lib/api';
import type {
  BoardData,
  BoardListItem,
  CardData,
  ColumnData,
  Priority,
  WorkspaceData,
} from '@/lib/board-types';

// Тонкая обёртка над api для эндпоинтов доски. Токен подставляется
// автоматически (api берёт из стора), авто-refresh на 401 тоже работает.

export const boardApi = {
  // Workspace
  listWorkspaces: (): Promise<WorkspaceData[]> => api.get('/workspaces'),

  // Доски
  listBoards: (workspaceId: string): Promise<BoardListItem[]> =>
    api.get(`/workspaces/${workspaceId}/boards`),

  createBoard: (workspaceId: string, name: string): Promise<BoardListItem> =>
    api.post(`/workspaces/${workspaceId}/boards`, { name }),

  // Доска со структурой (колонки + карточки вложенно).
  getBoard: (boardId: string): Promise<BoardData> => api.get(`/boards/${boardId}`),

  // Колонки
  createColumn: (boardId: string, name: string): Promise<ColumnData> =>
    api.post(`/boards/${boardId}/columns`, { name }),

  updateColumn: (columnId: string, name: string): Promise<{ id: string; name: string }> =>
    api.patch(`/columns/${columnId}`, { name }),

  deleteColumn: (columnId: string): Promise<void> => api.delete(`/columns/${columnId}`),

  // Карточки
  createCard: (
    columnId: string,
    data: { title: string; description?: string; priority?: Priority },
  ): Promise<CardData> => api.post(`/columns/${columnId}/cards`, data),

  updateCard: (
    cardId: string,
    data: { title?: string; description?: string | null; priority?: Priority },
  ): Promise<CardData> => api.patch(`/cards/${cardId}`, data),

  deleteCard: (cardId: string): Promise<void> => api.delete(`/cards/${cardId}`),

  // Перемещение карточки. Бэкенд сам считает позицию по соседям.
  moveCard: (
    cardId: string,
    data: { targetColumnId: string; beforeCardId?: string | null; afterCardId?: string | null },
  ): Promise<CardData> => api.post(`/cards/${cardId}/move`, data),
};
