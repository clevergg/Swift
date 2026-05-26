import { z } from 'zod';

/**
 * Схемы для авторизации.
 *
 * ⚡ КЛЮЧЕВАЯ ИДЕЯ МОНОРЕПО:
 * Эта схема — единый источник истины для контракта между фронтом и бэком.
 *
 * На бэкенде (NestJS):
 *   - валидируем входящий body через RegisterSchema.parse(body)
 *   - если данные кривые — Zod кидает ошибку, возвращаем 400
 *
 * На фронте (Next.js):
 *   - той же схемой валидируем форму через react-hook-form + zodResolver
 *   - пользователь видит ошибки до отправки запроса
 *
 * Если поменяем требование к паролю ЗДЕСЬ — оно изменится и на фронте,
 * и на бэке одновременно. Невозможно рассинхронизировать. Это и есть
 * "единый источник истины", который невозможен в polyrepo без дублирования.
 */

export const RegisterSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z
    .string()
    .min(8, 'Минимум 8 символов')
    .max(72, 'Максимум 72 символа') // ограничение argon2/bcrypt
    .regex(/[A-Z]/, 'Нужна хотя бы одна заглавная буква')
    .regex(/[0-9]/, 'Нужна хотя бы одна цифра'),
  name: z.string().min(2, 'Минимум 2 символа').max(50),
});
export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
});
export type LoginDto = z.infer<typeof LoginSchema>;

/**
 * Ответ сервера при успешной авторизации.
 * accessToken возвращается в теле, refreshToken — в httpOnly cookie.
 */
export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    avatarUrl: z.string().url().nullable(),
  }),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
