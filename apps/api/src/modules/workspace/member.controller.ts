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
import { prisma, Role } from '@swift/db';
import {
  AddMemberSchema,
  UpdateMemberRoleSchema,
  type AddMemberDto,
  type UpdateMemberRoleDto,
} from '@swift/types';

import { MemberService } from './member.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


@ApiTags('members')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  // Список участников — VIEWER (любой участник видит состав).
  @Get()
  @Roles(Role.VIEWER)
  @ApiOperation({ summary: 'Список участников workspace' })
  async list(
    @Param('workspaceId') workspaceId: string,
  ): Promise<Array<{ userId: string; email: string; name: string; role: string }>> {
    return this.memberService.findWorkspaceMembers(workspaceId);
  }

  // Добавить участника — ADMIN и выше.
  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Добавить участника по email' })
  async add(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() actor: { id: string },
    @Body(new ZodValidationPipe(AddMemberSchema)) dto: AddMemberDto,
  ): Promise<{ userId: string; email: string; role: string }> {
    // Роль актора нужна сервису для правила "не назначай выше своей".
    const actorRole = await this.getActorRole(workspaceId, actor.id);
    return this.memberService.addMember(workspaceId, actorRole, dto.email, dto.role);
  }

  // Сменить роль участника — ADMIN и выше (внутри сервиса доп. правила).
  @Patch(':userId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Сменить роль участника' })
  async updateRole(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() actor: { id: string },
    @Body(new ZodValidationPipe(UpdateMemberRoleSchema)) dto: UpdateMemberRoleDto,
  ): Promise<{ userId: string; role: string }> {
    const actorRole = await this.getActorRole(workspaceId, actor.id);
    return this.memberService.updateRole(
      workspaceId,
      actor.id,
      actorRole,
      targetUserId,
      dto.role,
    );
  }

  // Удалить участника — ADMIN и выше (или самоудаление, проверяется в сервисе).
  @Delete(':userId')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить участника' })
  async remove(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() actor: { id: string },
  ): Promise<void> {
    const actorRole = await this.getActorRole(workspaceId, actor.id);
    await this.memberService.removeMember(workspaceId, actor.id, actorRole, targetUserId);
  }

  // Хелпер: достать роль актора в workspace (RolesGuard уже проверил, что он
  // участник с достаточной ролью, тут берём точное значение для правил сервиса).
  private async getActorRole(workspaceId: string, userId: string): Promise<Role> {
    const member = await prisma.member.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    // RolesGuard гарантировал, что member есть. Но на всякий — fallback.
    return member?.role ?? Role.VIEWER;
  }
}
