import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@swift/db';
import {
  UpdateBoardSchema,
  CreateColumnSchema,
  type UpdateBoardDto,
  type CreateColumnDto,
} from '@swift/types';

import { BoardService } from './board.service';
import { ColumnService } from './column.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


// Операции с конкретной доской: короткий URL /boards/:boardId.
// RolesGuard вычисляет workspaceId из boardId (цепочка board -> workspace).
@ApiTags('boards')
@ApiBearerAuth()
@Controller('boards/:boardId')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BoardItemController {
  constructor(
    private readonly boardService: BoardService,
    private readonly columnService: ColumnService,
  ) {}

  // Получить доску с колонками и карточками.
  @Get()
  @Roles(Role.VIEWER)
  @ApiOperation({ summary: 'Получить доску со структурой' })
  async getOne(@Param('boardId') boardId: string): Promise<unknown> {
    return this.boardService.findOne(boardId);
  }

  @Patch()
  @Roles(Role.MEMBER)
  @ApiOperation({ summary: 'Обновить доску' })
  async update(
    @Param('boardId') boardId: string,
    @Body(new ZodValidationPipe(UpdateBoardSchema)) dto: UpdateBoardDto,
  ): Promise<{ id: string; name: string }> {
    return this.boardService.update(boardId, dto);
  }

  @Delete()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить доску' })
  async remove(@Param('boardId') boardId: string): Promise<void> {
    await this.boardService.remove(boardId);
  }

  // Создать колонку в доске (boardId в URL - естественно для вложенного создания).
  @Post('columns')
  @Roles(Role.MEMBER)
  @ApiOperation({ summary: 'Создать колонку в доске' })
  async createColumn(
    @Param('boardId') boardId: string,
    @Body(new ZodValidationPipe(CreateColumnSchema)) dto: CreateColumnDto,
  ): Promise<{ id: string; name: string; position: number }> {
    return this.columnService.create(boardId, dto);
  }
}
