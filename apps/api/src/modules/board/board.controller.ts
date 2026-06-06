import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@swift/db';
import {
  CreateBoardSchema,
  type CreateBoardDto,
} from '@swift/types';

import { BoardService } from './board.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


@ApiTags('boards')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/boards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  @Roles(Role.VIEWER)
  @ApiOperation({ summary: 'Список досок workspace' })
  async list(@Param('workspaceId') workspaceId: string): Promise<Array<{ id: string; name: string }>> {
    return this.boardService.findByWorkspace(workspaceId);
  }

  @Post()
  @Roles(Role.MEMBER)
  @ApiOperation({ summary: 'Создать доску' })
  async create(
    @Param('workspaceId') workspaceId: string,
    @Body(new ZodValidationPipe(CreateBoardSchema)) dto: CreateBoardDto,
  ): Promise<{ id: string; name: string }> {
    return this.boardService.create(workspaceId, dto);
  }
}
