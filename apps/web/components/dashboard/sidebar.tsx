'use client';

import { LayoutGrid, Plus, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useWorkspace } from '@/lib/workspace-store';

// Сайдбар дашборда: переключатель workspace, список досок, создание доски.
export function Sidebar() {
  const pathname = usePathname();
  const workspaces = useWorkspace((s) => s.workspaces);
  const activeWorkspaceId = useWorkspace((s) => s.activeWorkspaceId);
  const boards = useWorkspace((s) => s.boards);
  const loadWorkspaces = useWorkspace((s) => s.loadWorkspaces);
  const setActiveWorkspace = useWorkspace((s) => s.setActiveWorkspace);
  const createBoard = useWorkspace((s) => s.createBoard);

  const [creating, setCreating] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [wsMenuOpen, setWsMenuOpen] = useState(false);

  // Загружаем workspace и доски при монтировании.
  useEffect(() => {
    void loadWorkspaces();
  }, [loadWorkspaces]);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  const onCreateBoard = async (): Promise<void> => {
    const name = newBoardName.trim();
    if (!name) {
      return;
    }
    await createBoard(name);
    setNewBoardName('');
    setCreating(false);
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-glass-border bg-surface/30 backdrop-blur-xl">
      {/* Workspace switcher */}
      <div className="relative border-b border-glass-border p-3">
        <button
          onClick={() => setWsMenuOpen((v) => !v)}
          className="glass flex w-full items-center justify-between rounded-glass px-3 py-2.5 text-sm"
        >
          <span className="truncate font-medium text-ink">
            {activeWorkspace?.name ?? 'Загрузка...'}
          </span>
          <ChevronDown size={16} className="text-ink-muted" />
        </button>

        {wsMenuOpen && workspaces.length > 0 ? (
          <div className="glass-strong absolute left-3 right-3 top-full z-10 mt-1 rounded-glass p-1">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  void setActiveWorkspace(ws.id);
                  setWsMenuOpen(false);
                }}
                className={`block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface/50 ${
                  ws.id === activeWorkspaceId ? 'text-accent' : 'text-ink'
                }`}
              >
                {ws.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Список досок */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Доски
          </span>
          <button
            onClick={() => setCreating((v) => !v)}
            className="rounded-md p-1 text-ink-muted hover:bg-surface/50 hover:text-ink"
            aria-label="Создать доску"
          >
            <Plus size={16} />
          </button>
        </div>

        {creating ? (
          <div className="mb-2 px-1">
            <input
              autoFocus
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void onCreateBoard();
                if (e.key === 'Escape') setCreating(false);
              }}
              placeholder="Название доски"
              className="glass-strong w-full rounded-glass px-3 py-2 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
        ) : null}

        <ul className="space-y-0.5">
          {boards.map((board) => {
            const href = `/board/${board.id}`;
            const active = pathname === href;
            return (
              <li key={board.id}>
                <Link
                  href={href}
                  className={`flex items-center gap-2.5 rounded-glass px-3 py-2 text-sm ${
                    active
                      ? 'bg-accent/15 text-accent'
                      : 'text-ink hover:bg-surface/50'
                  }`}
                >
                  <LayoutGrid size={16} />
                  <span className="truncate">{board.name}</span>
                </Link>
              </li>
            );
          })}
          {boards.length === 0 ? (
            <li className="px-3 py-2 text-sm text-ink-muted">Пока нет досок</li>
          ) : null}
        </ul>
      </nav>
    </aside>
  );
}
