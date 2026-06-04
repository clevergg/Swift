import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import { validateEnv } from './config/env.validation';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // ConfigModule — управление переменными окружения.
    // isGlobal: true — конфиг доступен во всех модулях без повторного импорта.
    // validate — наша Zod-проверка env при старте (упадём сразу, если env кривой).
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env['NODE_ENV'] === 'development'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
        // Уровень логирования из env (debug в dev, info в prod по умолчанию).
        level: process.env['LOG_LEVEL'] ?? (process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'),
      },
    }),

    // Модули фич.
    HealthModule,
  ],
})
export class AppModule {}
