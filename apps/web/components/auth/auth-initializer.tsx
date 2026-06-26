'use client';

import { useEffect } from 'react';

import { useAuth } from '@/lib/auth-store';

// Запускает восстановление сессии при старте приложения.
// При загрузке/перезагрузке стор пустой (токен в памяти обнулился) — здесь
// дёргаем initialize(): refresh по cookie -> /auth/me -> наполнение стора.
// initialize идемпотентен (повторно не запускается, если status !== 'idle'),
// поэтому повторные ремаунты безопасны.
//
// Компонент ничего не рендерит — только эффект. Вставляется в корневой layout.
export function AuthInitializer() {
  const initialize = useAuth((s) => s.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return null;
}
