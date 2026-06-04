import { z } from 'zod';

/**
 * Схема переменных окружения.
 *
 * ЗАЧЕМ: если приложение стартует без нужной переменной (например, забыли
 * DATABASE_URL), лучше упасть СРАЗУ при старте с понятной ошибкой, чем
 * получить непонятный сбой позже в рантайме. Эта схема проверяет env
 * при запуске — нет переменной или она кривая, приложение не стартует.
 *
 * Снова Zod как единый инструмент валидации — и для запросов, и для env.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.coerce.number().default(3001), // coerce: строку "3001" из env приводит к числу
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  // CORS: список разрешённых origin через запятую
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Валидатор для @nestjs/config. ConfigModule вызовет эту функцию при старте,
 * передав сырой process.env. Если схема не сходится — Zod кинет ошибку,
 * и приложение не запустится (это правильно — лучше упасть на старте).
 */
export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
