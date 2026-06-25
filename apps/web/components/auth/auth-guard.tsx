'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { FullPageLoader } from '@/components/ui/full-page-loader';
import { useAuth } from '@/lib/auth-store';

// Клиентская защита приватных страниц — второй слой после middleware.
// middleware отсекает по наличию cookie (грубо), guard проверяет реальное
// состояние стора после восстановления сессии (точно):
//   idle/loading   -> лоадер (сессия ещё восстанавливается)
//   authenticated  -> рендерим детей
//   unauthenticated-> редирект на /login (refresh оказался невалиден —
//                     случай, который middleware пропускает)
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const status = useAuth((s) => s.status);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  // Пока сессия восстанавливается — лоадер (не мелькаем контентом).
  if (status === 'idle' || status === 'loading') {
    return <FullPageLoader />;
  }

  // Не залогинен — лоадер, пока редирект из useEffect не сработал
  // (не рендерим защищённый контент ни на мгновение).
  if (status === 'unauthenticated') {
    return <FullPageLoader />;
  }

  // authenticated — пускаем.
  return <>{children}</>;
}
