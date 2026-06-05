// ПРИМЕР применения RBAC. Показывает, как @Roles + guards защищают эндпоинты.
// Это демонстрационный контроллер — реальный CRUD workspaces будет в issue #11.

import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@swift/db';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('workspaces')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId')
// Оба guard на уровне контроллера: сначала JwtAuthGuard (аутентификация),
// потом RolesGuard (роль). Порядок важен — RolesGuard полагается на user,
// которого кладёт JwtAuthGuard.
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkspaceExampleController {
  // VIEWER и выше могут смотреть доски (любой участник workspace).
  @Get('boards')
  @Roles(Role.VIEWER)
  listBoards(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: { id: string },
  ): { message: string } {
    return { message: `Доски workspace ${workspaceId} для юзера ${user.id}` };
  }

  // MEMBER и выше могут создавать доски (VIEWER не может — только смотрит).
  @Post('boards')
  @Roles(Role.MEMBER)
  createBoard(@Param('workspaceId') workspaceId: string): { message: string } {
    return { message: `Доска создана в workspace ${workspaceId}` };
  }

  // Только ADMIN и OWNER могут удалять доски.
  @Delete('boards/:boardId')
  @Roles(Role.ADMIN)
  deleteBoard(
    @Param('workspaceId') workspaceId: string,
    @Param('boardId') boardId: string,
  ): { message: string } {
    return { message: `Доска ${boardId} удалена из workspace ${workspaceId}` };
  }
}
