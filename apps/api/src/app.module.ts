import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import { validateEnv } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { WorkspaceExampleController } from './modules/workspace/workspace-example.controller';

@Module({
  imports: [
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
        level: process.env['LOG_LEVEL'] ?? (process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'),
      },
    }),
    AuthModule,

    HealthModule,
  ],
  controllers: [WorkspaceExampleController]
})
export class AppModule {}
