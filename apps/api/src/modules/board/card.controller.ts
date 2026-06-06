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


@ApiTags('cards')
@ApiBearerAuth()
@Controller('cards/:cardId')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CardController {
  constructor(private readonly cardService: CardService) {}

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
    return this.cardService.update(cardId, dto);
  }

  @Delete()
  @Roles(Role.MEMBER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить карточку' })
  async remove(@Param('cardId') cardId: string): Promise<void> {
    await this.cardService.remove(cardId);
  }

  // Перемещение карточки (drag-and-drop).
  @Post('move')
  @Roles(Role.MEMBER)
  @ApiOperation({ summary: 'Переместить карточку (drag-and-drop)' })
  async move(
    @Param('cardId') cardId: string,
    @Body(new ZodValidationPipe(MoveCardSchema)) dto: MoveCardDto,
  ): Promise<unknown> {
    return this.cardService.move(cardId, dto);
  }
}
