'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, type LoginDto, type AuthResponse } from '@swift/types';
import { Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { PillButton } from '@/components/ui/pill-button';
import { TextField } from '@/components/ui/text-field';
import { api, ApiException } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';

export function LoginForm() {
  const router = useRouter();
  const login = useAuth((s) => s.login);

  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDto>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginDto): Promise<void> => {
    setFormError(null);
    try {
      // skipAuth: login — auth-роут, токена ещё нет, refresh не нужен.
      const res = await api.post<AuthResponse>('/auth/login', data, { skipAuth: true });
      // Сохраняем токен и юзера в стор. Теперь сессия живёт.
      login(res);
      router.push('/');
    } catch (e) {
      if (e instanceof ApiException) {
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
