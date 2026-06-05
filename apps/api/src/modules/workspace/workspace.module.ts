import { Module } from '@nestjs/common';

import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';

@Module({
  controllers: [WorkspaceController, MemberController],
  providers: [WorkspaceService, MemberService],
})
export class WorkspaceModule {}
