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
  app.use(cookieParser()); 
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('api');
  const corsOrigins = (process.env['CORS_ORIGINS'] ?? 'http://localhost:3000').split(',');
  app.enableCors({
    origin: corsOrigins,
    credentials: true, // разрешаем куки (нужно для refresh-токена позже)
  });
  

  // Swagger - автодокументация API
  // Доступна будет на /api/docs.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Swift CRM API')
    .setDescription('API канбан-CRM платформы Swift')
    .setVersion('0.1.0')
    .addBearerAuth() // покажет поле для JWT-токена в Swagger UI (пригодится с auth)
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env['API_PORT'] ?? 3001;
  await app.listen(port);
  app.useWebSocketAdapter(new IoAdapter(app));
  const logger = app.get(Logger);
  logger.log(`API запущен на http://localhost:${port}`);
  logger.log(`Swagger доступен на http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
   
  console.error('Ошибка запуска приложения:', err);
  process.exit(1);
});
