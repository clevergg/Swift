import {
  type ExceptionFilter,
  Catch,
  type ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { type Request, type Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR; 
    let body: Record<string, unknown> = {
      code: 'INTERNAL_ERROR',
      message: 'Внутренняя ошибка сервера',
    };

    if (exception instanceof HttpException) {
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
