'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, type LoginDto, type AuthResponse } from '@swift/types';
import { Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { api, ApiException } from '@/lib/api';
import { PillButton } from '@/components/ui/pill-button';
import { TextField } from '@/components/ui/text-field';

// Форма входа. Валидация формы — LoginSchema из @swift/types (та же,
// что валидирует бэкенд). Отправка через нашу api-обёртку.
export function LoginForm() {
  const router = useRouter();
  // formError — ошибка от API (неверный логин/пароль и т.д.).
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDto>({
    resolver: zodResolver(LoginSchema),
  });

  // onSubmit вызывается только если форма прошла Zod-валидацию.
  const onSubmit = async (data: LoginDto): Promise<void> => {
    setFormError(null);
    try {
      const res = await api.post<AuthResponse>('/auth/login', data);
      // Токен пока просто получаем (полноценное хранение — в #16).
      // accessToken придёт в res.accessToken. Сейчас редиректим на главную.
      void res;
      router.push('/');
    } catch (e) {
      if (e instanceof ApiException) {
        // 401 — неверные данные. Показываем дружелюбное сообщение.
        setFormError(
          e.status === 401 ? 'Неверный email или пароль' : e.error.message,
        );
      } else {
        setFormError('Не удалось войти. Попробуйте позже');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <TextField
        label="Email"
        type="email"
        placeholder="you@example.com"
        icon={<Mail size={18} />}
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="Пароль"
        type="password"
        placeholder="••••••••"
        icon={<Lock size={18} />}
        error={errors.password?.message}
        {...register('password')}
      />

      {formError ? (
        <p className="mb-4 rounded-glass bg-red-500/10 px-4 py-2.5 text-sm text-red-500">
          {formError}
        </p>
      ) : null}

      <PillButton
        type="submit"
        variant="accent"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Вход...' : 'Войти'}
      </PillButton>

      <p className="mt-5 text-center text-sm text-ink-muted">
        Нет аккаунта?{' '}
        <Link href="/register" className="text-accent hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
}
