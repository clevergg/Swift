// Типы данных доски на фронте — соответствуют тому, что отдаёт API
// (GET /boards/:id возвращает доску с колонками и карточками вложенно).

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface CardData {
  id: string;
  title: string;
  description: string | null;
  position: number;
  priority: Priority;
  columnId: string;
  assigneeId: string | null;
  createdById: string | null;
}

export interface ColumnData {
  id: string;
  name: string;
  position: number;
  boardId: string;
  cards: CardData[];
}

export interface BoardData {
  id: string;
  name: string;
  description: string | null;
  columns: ColumnData[];
}

// Элемент списка досок (GET /workspaces/:id/boards).
export interface BoardListItem {
  id: string;
  name: string;
}

// Workspace (GET /workspaces).
export interface WorkspaceData {
  id: string;
  name: string;
  slug: string;
  role: string;
}
