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

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Создать workspace (создатель становится OWNER)' })
  async create(
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(CreateWorkspaceSchema)) dto: CreateWorkspaceDto,
  ): Promise<{ id: string; name: string; slug: string }> {
    return this.workspaceService.create(user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Список моих workspace' })
  async list(
    @CurrentUser() user: { id: string },
  ): Promise<Array<{ id: string; name: string; slug: string; role: string }>> {
    return this.workspaceService.findUserWorkspaces(user.id);
  }

  @Get(':workspaceId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VIEWER)
  @ApiOperation({ summary: 'Получить workspace' })
  async getOne(
    @Param('workspaceId') workspaceId: string,
  ): Promise<{ id: string; name: string; slug: string }> {
    return this.workspaceService.findOne(workspaceId);
  }

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

  @Delete(':workspaceId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить workspace (только OWNER)' })
  async remove(@Param('workspaceId') workspaceId: string): Promise<void> {
    await this.workspaceService.remove(workspaceId);
  }
}
