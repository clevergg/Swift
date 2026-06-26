'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, type RegisterDto, type AuthResponse } from '@swift/types';
import { Mail, Lock, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { PillButton } from '@/components/ui/pill-button';
import { TextField } from '@/components/ui/text-field';
import { api, ApiException } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';

const RegisterFormSchema = RegisterSchema.extend({
  confirmPassword: z.string().min(1, 'Повторите пароль'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

export function RegisterForm() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
  });

  const onSubmit = async (data: RegisterFormValues): Promise<void> => {
    setFormError(null);
    try {
      const payload: RegisterDto = {
        email: data.email,
        password: data.password,
        name: data.name,
      };

      const res = await api.post<AuthResponse>('/auth/register', payload, { skipAuth: true });
      login(res);
      router.push('/');
    } catch (e) {
      if (e instanceof ApiException) {
        setFormError(
          e.status === 409
            ? 'Пользователь с таким email уже существует'
            : e.error.message,
        );
      } else {
        setFormError('Не удалось зарегистрироваться. Попробуйте позже');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <TextField
        label="Имя"
        type="text"
        placeholder="Как вас зовут"
        icon={<User size={18} />}
        error={errors.name?.message}
        {...register('name')}
      />
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
        placeholder="Минимум 8 символов"
        icon={<Lock size={18} />}
        error={errors.password?.message}
        {...register('password')}
      />
      <TextField
        label="Повторите пароль"
        type="password"
        placeholder="Ещё раз пароль"
        icon={<Lock size={18} />}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
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
        {isSubmitting ? 'Создание...' : 'Создать аккаунт'}
      </PillButton>

      <p className="mt-5 text-center text-sm text-ink-muted">
        Уже есть аккаунт?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Войти
        </Link>
      </p>
    </form>
  );
}
