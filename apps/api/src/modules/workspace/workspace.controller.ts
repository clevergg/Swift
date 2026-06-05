import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@swift/db';
import {
  CreateWorkspaceSchema,
  UpdateWorkspaceSchema,
  type CreateWorkspaceDto,
  type UpdateWorkspaceDto,
} from '@swift/types';

import { WorkspaceService } from './workspace.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


@ApiTags('workspaces')
@ApiBearerAuth()
@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  // Создание — любой залогиненный (только JwtAuthGuard, без проверки роли:
  // workspace ещё не существует, ролей в нём нет). Создатель станет OWNER.
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Создать workspace (создатель становится OWNER)' })
  async create(
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(CreateWorkspaceSchema)) dto: CreateWorkspaceDto,
  ): Promise<{ id: string; name: string; slug: string }> {
    return this.workspaceService.create(user.id, dto);
  }

  // Список своих workspace — JwtAuthGuard (RolesGuard не нужен: фильтруем
  // по самому юзеру, отдаём только те, где он участник).
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Список моих workspace' })
  async list(
    @CurrentUser() user: { id: string },
  ): Promise<Array<{ id: string; name: string; slug: string; role: string }>> {
    return this.workspaceService.findUserWorkspaces(user.id);
  }

  // Получить один — нужна роль VIEWER (быть участником).
  @Get(':workspaceId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VIEWER)
  @ApiOperation({ summary: 'Получить workspace' })
  async getOne(
    @Param('workspaceId') workspaceId: string,
  ): Promise<{ id: string; name: string; slug: string }> {
    return this.workspaceService.findOne(workspaceId);
  }

  // Обновление — ADMIN и выше.
  @Patch(':workspaceId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Обновить workspace' })
  async update(
    @Param('workspaceId') workspaceId: string,
    @Body(new ZodValidationPipe(UpdateWorkspaceSchema)) dto: UpdateWorkspaceDto,
  ): Promise<{ id: string; name: string; slug: string }> {
    return this.workspaceService.update(workspaceId, dto);
  }

  // Удаление — только OWNER.
  @Delete(':workspaceId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить workspace (только OWNER)' })
  async remove(@Param('workspaceId') workspaceId: string): Promise<void> {
    await this.workspaceService.remove(workspaceId);
  }
}
