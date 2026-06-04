import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { prisma } from '@swift/db';

@ApiTags('health')
@Controller('health')
export class HealthController {
  /**
   * GET /health
   * Проверяет, что сервис жив И что база отвечает (простой запрос SELECT 1).
   */
  @Get()
  @ApiOperation({ summary: 'Проверка живости сервиса и базы данных' })
  async check(): Promise<{ status: string; database: string; timestamp: string }> {
    let databaseStatus = 'down';
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'up';
    } catch {
      databaseStatus = 'down';
    }

    return {
      status: 'ok',
      database: databaseStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
