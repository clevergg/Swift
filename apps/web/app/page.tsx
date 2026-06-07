import { Cloud } from 'lucide-react';

import { ThemeToggle } from '@/components/theme/theme-toggle';
import { GlassPanel } from '@/components/ui/glass-panel';
import { PillButton } from '@/components/ui/pill-button';


export default function HomePage(){
  return (
    <main className="min-h-screen px-8 py-7">
      <header className="mb-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="glass flex h-10 w-10 items-center justify-center rounded-glass">
            <Cloud size={24} />
          </div>
          <span className="text-lg font-medium tracking-tight text-ink">Swift</span>
        </div>
        <ThemeToggle />
      </header>

      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-medium leading-tight tracking-tight text-ink">
          Управляй командой легко и спокойно
        </h1>
        <p className="mb-10 text-lg text-ink-muted">
          CRM-платформа, где всё на своих местах
        </p>
      </div>

      <div className="mx-auto max-w-md">
        <GlassPanel className="p-6">
          <p className="mb-1 text-sm text-ink-muted">Email</p>
          <div className="glass-strong mb-4 rounded-glass px-4 py-3 text-sm text-ink-muted">
            you@example.com
          </div>
          <p className="mb-1 text-sm text-ink-muted">Пароль</p>
          <div className="glass-strong mb-5 rounded-glass px-4 py-3 text-sm text-ink-muted">
            ********
          </div>
          <PillButton variant="accent" className="w-full">
            Войти
          </PillButton>
        </GlassPanel>

        <div className="mt-6 flex justify-center gap-3">
          <PillButton>Стеклянная кнопка</PillButton>
          <PillButton variant="accent">Акцентная</PillButton>
        </div>
      </div>
    </main>
  );
}
