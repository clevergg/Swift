import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  // variant: glass - стеклянная (на воздушных экранах), accent - акцентная.
  variant?: 'glass' | 'accent';
}

// Капсульная кнопка (pill) - основная кнопка в дизайне Swift.
export function PillButton({
  children,
  variant = 'glass',
  className = '',
  ...props
}: PillButtonProps){
  const styles =
    variant === 'accent'
      ? 'bg-accent text-accent-ink shadow-glass-sm'
      : 'glass text-ink shadow-glass-sm';
  return (
    <button
      className={`rounded-pill px-5 py-3 text-sm font-medium transition-transform active:scale-[0.98] ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
