'use client';

import { create } from 'zustand';

import { boardApi } from '@/lib/board-api';
import type { BoardListItem, WorkspaceData } from '@/lib/board-types';

// Стор рабочего пространства: список workspace юзера, активный workspace,
// список его досок (для сайдбара). Контент конкретной доски — отдельный стор
// (Поставка 2), чтобы не смешивать навигацию и содержимое.

interface WorkspaceState {
  workspaces: WorkspaceData[];
  activeWorkspaceId: string | null;
  boards: BoardListItem[];
  loading: boolean;

  // Загрузка workspace юзера + досок активного. Вызывается при входе в дашборд.
  loadWorkspaces: () => Promise<void>;
  // Сменить активный workspace и подгрузить его доски.
  setActiveWorkspace: (workspaceId: string) => Promise<void>;
  // Создать доску в активном workspace.
  createBoard: (name: string) => Promise<BoardListItem | null>;
}

export const useWorkspace = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  boards: [],
  loading: false,

  loadWorkspaces: async () => {
    set({ loading: true });
    try {
      const workspaces = await boardApi.listWorkspaces();
      // Активный — первый по списку (у юзера всегда есть хотя бы один,
      // т.к. workspace создаётся при регистрации).
      const activeId = workspaces[0]?.id ?? null;
      let boards: BoardListItem[] = [];
      if (activeId) {
        boards = await boardApi.listBoards(activeId);
      }
      set({ workspaces, activeWorkspaceId: activeId, boards, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setActiveWorkspace: async (workspaceId) => {
    set({ activeWorkspaceId: workspaceId, loading: true });
    try {
      const boards = await boardApi.listBoards(workspaceId);
      set({ boards, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createBoard: async (name) => {
    const workspaceId = get().activeWorkspaceId;
    if (!workspaceId) {
      return null;
    }
    try {
      const board = await boardApi.createBoard(workspaceId, name);
      // Добавляем в список (оптимистично — сразу видно в сайдбаре).
      set((state) => ({ boards: [...state.boards, board] }));
      return board;
    } catch {
      return null;
    }
  },
}));
