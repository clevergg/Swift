import {
  Controller,
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
  UpdateColumnSchema,
  CreateCardSchema,
  type UpdateColumnDto,
  type CreateCardDto,
} from '@swift/types';

import { CardService } from './card.service';
import { ColumnService } from './column.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


@ApiTags('columns')
@ApiBearerAuth()
@Controller('columns/:columnId')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ColumnController {
  constructor(
    private readonly columnService: ColumnService,
    private readonly cardService: CardService,
  ) {}

  @Patch()
  @Roles(Role.MEMBER)
  @ApiOperation({ summary: 'Обновить колонку' })
  async update(
    @Param('columnId') columnId: string,
    @Body(new ZodValidationPipe(UpdateColumnSchema)) dto: UpdateColumnDto,
  ): Promise<{ id: string; name: string }> {
    return this.columnService.update(columnId, dto);
  }

  @Delete()
  @Roles(Role.MEMBER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить колонку' })
  async remove(@Param('columnId') columnId: string): Promise<void> {
    await this.columnService.remove(columnId);
  }

  // Создать карточку в колонке.
  @Post('cards')
  @Roles(Role.MEMBER)
  @ApiOperation({ summary: 'Создать карточку в колонке' })
  async createCard(
    @Param('columnId') columnId: string,
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(CreateCardSchema)) dto: CreateCardDto,
  ): Promise<unknown> {
    return this.cardService.create(columnId, user.id, dto);
  }
}
