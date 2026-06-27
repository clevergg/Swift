import './load-env';

import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // За прокси (Render/Vercel) — доверяем заголовкам X-Forwarded-*, иначе
  // secure-cookie и протокол определяются неверно.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(cookieParser());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('api');

  const corsOrigins = (process.env['CORS_ORIGINS'] ?? 'http://localhost:3000').split(',');
  app.enableCors({
    origin: corsOrigins,
    credentials: true, // разрешаем куки (refresh-токен)
  });

  // Swagger — автодокументация API на /api/docs.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Swift CRM API')
    .setDescription('API канбан-CRM платформы Swift')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // PORT — переменная, которую задаёт Render. Локально — API_PORT. Фолбэк 3001.
  // Слушаем на 0.0.0.0, чтобы Render видел сервис извне контейнера.
  const port = process.env['PORT'] ?? process.env['API_PORT'] ?? 3001;
  await app.listen(port, '0.0.0.0');

  app.useWebSocketAdapter(new IoAdapter(app));

  const logger = app.get(Logger);
  logger.log(`API запущен на порту ${port}`);
  logger.log(`Swagger доступен на /api/docs`);
}

bootstrap().catch((err) => {
  console.error('Ошибка запуска приложения:', err);
  process.exit(1);
});
