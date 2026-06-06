import { Injectable } from '@nestjs/common';

import { RealtimeGateway } from './realtime.gateway';

// Типы событий канбана - чтобы не было опечаток в строках событий.
export const RealtimeEvent = {
  CardCreated: 'card.created',
  CardUpdated: 'card.updated',
  CardMoved: 'card.moved',
  CardDeleted: 'card.deleted',
  ColumnCreated: 'column.created',
  ColumnUpdated: 'column.updated',
  ColumnDeleted: 'column.deleted',
  BoardUpdated: 'board.updated',
} as const;

export type RealtimeEventName = (typeof RealtimeEvent)[keyof typeof RealtimeEvent];

@Injectable()
export class RealtimeService {
  constructor(private readonly gateway: RealtimeGateway) {}

  emitToBoard(boardId: string, event: RealtimeEventName, payload: unknown): void {
    this.gateway.emitToBoard(boardId, event, payload);
  }
}
