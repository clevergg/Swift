import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { prisma } from '@swift/db';
import { Server, Socket } from 'socket.io';

interface JwtPayload {
  sub: string;
  email: string;
  jti: string;
}

interface AuthSocket extends Socket {
  userId?: string;
}
/**
 * RealtimeGateway - WebSocket-шлюз для real-time обновлений канбана.
 *
 * Подход: мутации идут через HTTP (REST с RBAC), а этот gateway только
 * РАССЫЛАЕТ обновления подписчикам доски. Клиент:
 *  1. Подключается с JWT (handshake.auth.token) - авторизация соединения.
 *  2. Шлёт 'board:join' с boardId - вступает в комнату доски (проверяем доступ).
 *  3. Получает события (card.moved и т.д.), которые сервер шлёт в комнату.
 *
 * cors: настроен под фронт. namespace по умолчанию.
 */
@WebSocketGateway({
  cors: { origin: true, credentials: true },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: AuthSocket): Promise<void> {
    try {
      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn('WS: подключение без токена, отклонено');
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env['JWT_ACCESS_SECRET'],
      });

      client.userId = payload.sub;
      this.logger.log(`WS: подключился юзер ${payload.sub}`);
    } catch {
      this.logger.warn('WS: невалидный токен, отклонено');
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthSocket): void {
    this.logger.log(`WS: отключился юзер ${client.userId ?? 'unknown'}`);
  }

  @SubscribeMessage('board:join')
  async handleJoinBoard(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { boardId: string },
  ): Promise<{ ok: boolean; error?: string }> {
    if (!client.userId) {
      return { ok: false, error: 'Не авторизован' };
    }
    const boardId = data?.boardId;
    if (!boardId) {
      return { ok: false, error: 'boardId обязателен' };
    }

    const allowed = await this.userCanAccessBoard(client.userId, boardId);
    if (!allowed) {
      return { ok: false, error: 'Нет доступа к доске' };
    }

    await client.join(this.boardRoom(boardId));
    this.logger.log(`WS: юзер ${client.userId} вошёл в доску ${boardId}`);
    return { ok: true };
  }

  @SubscribeMessage('board:leave')
  async handleLeaveBoard(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { boardId: string },
  ): Promise<{ ok: boolean }> {
    if (data?.boardId) {
      await client.leave(this.boardRoom(data.boardId));
    }
    return { ok: true };
  }

  emitToBoard(boardId: string, event: string, payload: unknown): void {
    this.server.to(this.boardRoom(boardId)).emit(event, payload);
  }

  private boardRoom(boardId: string): string {
    return `board:${boardId}`;
  }

  private extractToken(client: Socket): string | null {
    const authToken = (client.handshake.auth as { token?: string } | undefined)?.token;
    if (authToken) {
      return authToken;
    }
    const queryToken = client.handshake.query['token'];
    return typeof queryToken === 'string' ? queryToken : null;
  }

  private async userCanAccessBoard(userId: string, boardId: string): Promise<boolean> {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: { workspaceId: true },
    });
    if (!board) {
      return false;
    }
    const member = await prisma.member.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: board.workspaceId } },
    });
    return member !== null;
  }
}
