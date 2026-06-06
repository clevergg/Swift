import { Module } from '@nestjs/common';

import { BoardItemController } from './board-item.controller';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { ColumnController } from './column.controller';
import { ColumnService } from './column.service';

@Module({
  controllers: [
    BoardController,
    BoardItemController,
    ColumnController,
    CardController,
  ],
  providers: [BoardService, ColumnService, CardService],
})
export class BoardModule {}
