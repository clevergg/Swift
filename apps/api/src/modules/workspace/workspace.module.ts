import { Module } from '@nestjs/common';

import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';

// WorkspaceModule — CRUD workspace и управление участниками.
// Заменяет демонстрационный workspace-example.controller из задачи RBAC.
@Module({
  controllers: [WorkspaceController, MemberController],
  providers: [WorkspaceService, MemberService],
})
export class WorkspaceModule {}
