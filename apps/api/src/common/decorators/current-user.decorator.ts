import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): { id: string; email: string } => {
    const request = ctx.switchToHttp().getRequest<{ user: { id: string; email: string } }>();
    return request.user;
  },
);
