import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  // icon — иконка слева (lucide-компонент).
  icon?: ReactNode;
  // error — текст ошибки валидации под полем.
  error?: string;
}

// Поле ввода в стеклянном стиле Swift.
// forwardRef — чтобы react-hook-form мог зарегистрировать поле через ref.
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, icon, error, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        <label className="mb-1.5 block text-sm text-ink-muted">{label}</label>
        <div className="relative">
          {icon ? (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
              {icon}
            </span>
          ) : null}
          <input
            ref={ref}
            className={`glass-strong w-full rounded-glass py-3 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40 ${
              icon ? 'pl-11 pr-4' : 'px-4'
            } ${error ? 'ring-2 ring-red-400/50' : ''} ${className}`}
            {...props}
          />
        </div>
        {error ? <p className="mt-1.5 text-xs text-red-500">{error}</p> : null}
      </div>
    );
  },
);

TextField.displayName = 'TextField';
