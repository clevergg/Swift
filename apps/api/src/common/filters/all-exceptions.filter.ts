import {
  type ExceptionFilter,
  Catch,
  type ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { type Request, type Response } from 'express';

/**
 * AllExceptionsFilter — глобальный обработчик ошибок.
 *
 * ЗАЧЕМ: без него NestJS отдаёт ошибки в разном формате — встроенные
 * исключения в одном виде, неожиданные ошибки в другом. Этот фильтр
 * приводит ВСЕ ошибки к единому формату ответа:
 *   { code, message, details?, path, timestamp }
 * Так фронту проще обрабатывать ошибки — формат всегда одинаковый.
 *
 * @Catch() без аргументов = ловит вообще все исключения.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR; // по умолчанию 500
    let body: Record<string, unknown> = {
      code: 'INTERNAL_ERROR',
      message: 'Внутренняя ошибка сервера',
    };

    if (exception instanceof HttpException) {
      // Это ожидаемое исключение NestJS (наш BadRequestException из pipe,
      // NotFoundException и т.д.). У него есть статус и тело.
      status = exception.getStatus();
      const res = exception.getResponse();
      body =
        typeof res === 'string'
          ? { code: 'ERROR', message: res }
          : (res as Record<string, unknown>);
    } else if (exception instanceof Error) {
      body = {
        code: 'INTERNAL_ERROR',
        message:
          process.env['NODE_ENV'] === 'development'
            ? exception.message
            : 'Внутренняя ошибка сервера',
      };
    }
    response.status(status).json({
      ...body,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
