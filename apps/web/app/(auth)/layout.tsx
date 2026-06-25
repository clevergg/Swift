import { Cloud } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { ThemeToggle } from '@/components/theme/theme-toggle';

// Layout группы (auth) — общая оболочка для входа/регистрации.
// Центрирует форму, держит эстетику дымки, без сайдбара.
// Группа в скобках (auth) не влияет на URL: страницы будут /login, /register.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-10">
      {/* Шапка: лого слева, переключатель темы справа */}
      <header className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="glass flex h-9 w-9 items-center justify-center rounded-glass">
            <Cloud size={20} className="text-accent" />
          </div>
          <span className="text-base font-medium tracking-tight text-ink">Swift</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Контент (формы) — по центру */}
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
