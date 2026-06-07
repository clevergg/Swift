import type { ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  // strong - плотное стекло (рабочие карточки), иначе воздушное.
  strong?: boolean;
  className?: string;
}

// Стеклянная панель - базовый строительный блок дизайна Swift.
// Воздушная (glass) для обрамления, плотная (glass-strong) для контента.
export function GlassPanel({ children, strong, className = '' }: GlassPanelProps){
  const base = strong ? 'glass-strong' : 'glass';
  return <div className={`${base} rounded-glass shadow-glass ${className}`}>{children}</div>;
}
