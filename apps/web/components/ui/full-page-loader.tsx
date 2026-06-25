import { Loader2 } from 'lucide-react';

// Полноэкранный лоадер в эстетике дымки. Показывается, пока восстанавливается
// сессия (status idle/loading) — до того, как guard решит, пускать или нет.
export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="glass flex h-16 w-16 items-center justify-center rounded-glass">
        <Loader2 size={28} className="animate-spin text-accent" />
      </div>
    </div>
  );
}
