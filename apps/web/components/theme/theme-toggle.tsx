'use client';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useTheme } from './theme-provider';

// Кнопка переключения светлой/тёмной темы.
// mounted: до монтирования на клиенте рендерим нейтрально (без иконки),
// чтобы не было рассинхрона сервер/клиент (hydration mismatch) - на сервере
// тема неизвестна, реальную иконку показываем только после монтирования.
export function ThemeToggle() {
  const theme = useTheme((s) => s.theme);
  const toggle = useTheme((s) => s.toggle);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={toggle}
      aria-label="Переключить тему"
      className="glass rounded-pill flex h-10 w-10 items-center justify-center text-ink shadow-glass-sm transition-transform active:scale-95"
    >
      {/* Пока не смонтировано - пусто (избегаем mismatch). */}
      {mounted ? ( theme === 'light' ? <Moon size={18} /> : <Sun size={18} />
      ) : null}
    </button>
  );
}
