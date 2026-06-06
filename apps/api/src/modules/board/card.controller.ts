import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@swift/db';
import {
  UpdateCardSchema,
  MoveCardSchema,
  type UpdateCardDto,
  type MoveCardDto,
} from '@swift/types';

import { CardService } from './card.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RealtimeService, RealtimeEvent } from '../realtime/realtime.service';


// CardController + рассылка realtime-событий после операций.
// Мутация идёт через сервис (HTTP), затем эмитим событие подписчикам доски.
@ApiTags('cards')
@ApiBearerAuth()
@Controller('cards/:cardId')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CardController {
  constructor(
    private readonly cardService: CardService,
    private readonly realtime: RealtimeService,
  ) {}

  @Get()
  @Roles(Role.VIEWER)
  @ApiOperation({ summary: 'Получить карточку' })
  async getOne(@Param('cardId') cardId: string): Promise<unknown> {
    return this.cardService.findOne(cardId);
  }

  @Patch()
  @Roles(Role.MEMBER)
  @ApiOperation({ summary: 'Обновить карточку' })
  async update(
    @Param('cardId') cardId: string,
    @Body(new ZodValidationPipe(UpdateCardSchema)) dto: UpdateCardDto,
  ): Promise<unknown> {
    const card = await this.cardService.update(cardId, dto);
    // Рассылаем обновление на доску этой карточки.
    const boardId = await this.cardService.getBoardId(cardId);
    if (boardId) {
      this.realtime.emitToBoard(boardId, RealtimeEvent.CardUpdated, card);
    }
    return card;
  }

  @Delete()
  @Roles(Role.MEMBER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить карточку' })
  async remove(@Param('cardId') cardId: string): Promise<void> {
    // boardId узнаём ДО удаления (после карточки уже нет).
    const boardId = await this.cardService.getBoardId(cardId);
    await this.cardService.remove(cardId);
    if (boardId) {
      this.realtime.emitToBoard(boardId, RealtimeEvent.CardDeleted, { id: cardId });
    }
  }

  @Post('move')
  @Roles(Role.MEMBER)
  @ApiOperation({ summary: 'Переместить карточку (drag-and-drop)' })
  async move(
    @Param('cardId') cardId: string,
    @Body(new ZodValidationPipe(MoveCardSchema)) dto: MoveCardDto,
  ): Promise<unknown> {
    const card = await this.cardService.move(cardId, dto);
    // Самое частое real-time событие - перемещение карточки.
    const boardId = await this.cardService.getBoardId(cardId);
    if (boardId) {
      this.realtime.emitToBoard(boardId, RealtimeEvent.CardMoved, card);
    }
    return card;
  }
}
