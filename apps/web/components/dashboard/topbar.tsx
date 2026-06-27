'use client';

import { LogOut } from 'lucide-react';

import { useAuth } from '@/lib/auth-store';

// Топбар дашборда: имя пользователя и выход.
export function Topbar() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  const onLogout = async (): Promise<void> => {
    await logout();
    // ВРЕМЕННО (деплой Render): полная навигация вместо router.push('/login'),
    // чтобы middleware гарантированно увидел отсутствие cookie после выхода.
    // ОТКАТИТЬ после сдачи: вернуть useRouter + router.push('/login').
    window.location.href = '/login';
  };

  // Инициалы для аватара-заглушки.
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <header className="flex h-14 items-center justify-end gap-3 border-b border-glass-border bg-surface/20 px-5 backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <div className="glass flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-accent">
          {initials}
        </div>
        <span className="text-sm text-ink">{user?.name ?? ''}</span>
      </div>
      <button
        onClick={onLogout}
        className="rounded-glass p-2 text-ink-muted hover:bg-surface/50 hover:text-ink"
        aria-label="Выйти"
      >
        <LogOut size={18} />
      </button>
    </header>
  );
}
