'use client';

import { LayoutGrid } from 'lucide-react';
import Link from 'next/link';

import { useAuth } from '@/lib/auth-store';
import { useWorkspace } from '@/lib/workspace-store';

// Главная страница дашборда: приветствие и доски активного workspace плиткой.
export default function DashboardPage() {
  const user = useAuth((s) => s.user);
  const boards = useWorkspace((s) => s.boards);
  const activeWorkspaceId = useWorkspace((s) => s.activeWorkspaceId);
  const workspaces = useWorkspace((s) => s.workspaces);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-medium tracking-tight text-ink">
          Привет, {user?.name ?? ''}
        </h1>
        <p className="text-sm text-ink-muted">
          {activeWorkspace?.name ?? 'Рабочее пространство'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/board/${board.id}`}
            className="glass group flex h-32 flex-col justify-between rounded-glass p-5 transition hover:bg-surface/50"
          >
            <LayoutGrid size={22} className="text-accent" />
            <span className="font-medium text-ink">{board.name}</span>
          </Link>
        ))}

        {boards.length === 0 ? (
          <div className="col-span-full rounded-glass border border-dashed border-glass-border p-10 text-center text-ink-muted">
            Пока нет досок. Создайте первую через сайдбар слева.
          </div>
        ) : null}
      </div>
    </main>
  );
}
