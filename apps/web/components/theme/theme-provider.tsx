'use client';

import { useEffect } from 'react';
import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  userSet: boolean;
  toggle: () => void;
  setTheme: (t: Theme, byUser?: boolean) => void;
}

// Читаем стартовую тему синхронно (до первого рендера компонентов).
// Берём из класса на <html> (его уже мог поставить inline-скрипт), иначе из
// localStorage, иначе из системной темы. Так стор стартует с ПРАВИЛЬНОЙ темой,
// а не со светлой по умолчанию (иначе провайдер снимал бы класс, выставленный
// inline-скриптом).
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light'; // сервер — дефолт, реальная тема применится на клиенте
  }
  if (document.documentElement.classList.contains('dark')) {
    return 'dark';
  }
  const saved = localStorage.getItem('swift-theme');
  if (saved === 'dark' || saved === 'light') {
    return saved;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useTheme = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  userSet: false,
  toggle: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light', userSet: true })),
  setTheme: (t, byUser = false) => set({ theme: t, userSet: byUser }),
}));

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme((s) => s.theme);
  const setTheme = useTheme((s) => s.setTheme);

  // Применяем тему к <html> при каждом изменении. Сохраняем только выбор юзера.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (useTheme.getState().userSet) {
      localStorage.setItem('swift-theme', theme);
    }
  }, [theme]);

  // Слушаем изменения системной темы вживую (если юзер сам не выбирал).
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent): void => {
      if (!useTheme.getState().userSet && !localStorage.getItem('swift-theme')) {
        setTheme(e.matches ? 'dark' : 'light', false);
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [setTheme]);

  return <>{children}</>;
}
