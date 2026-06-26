'use client';

import { useRouter } from 'next/navigation';

import { GlassPanel } from '@/components/ui/glass-panel';
import { PillButton } from '@/components/ui/pill-button';
import { useAuth } from '@/lib/auth-store';

// Временная заглушка дашборда (#16). В #17 здесь будет реальный layout
// с сайдбаром и досками. Сейчас служит для проверки auth: показывает
// текущего пользователя из стора и кнопку выхода.
export default function DashboardPage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const status = useAuth((s) => s.status);
  const logout = useAuth((s) => s.logout);

  const onLogout = async (): Promise<void> => {
    await logout();
    router.push('/login');
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <GlassPanel className="w-full max-w-md p-8 text-center">
        <h1 className="mb-2 text-2xl font-medium tracking-tight text-ink">
          Дашборд
        </h1>
        <p className="mb-6 text-sm text-ink-muted">
          Скоро здесь будет канбан-доска (#17, #18)
        </p>

        <div className="mb-6 rounded-glass bg-surface/40 px-4 py-3 text-left text-sm">
          <p className="text-ink-muted">Статус: {status}</p>
          {user ? (
            <>
              <p className="text-ink">Имя: {user.name}</p>
              <p className="text-ink">Email: {user.email}</p>
            </>
          ) : (
            <p className="text-ink-muted">Пользователь не загружен</p>
          )}
        </div>

        <PillButton variant="accent" className="w-full" onClick={onLogout}>
          Выйти
        </PillButton>
      </GlassPanel>
    </main>
  );
}
