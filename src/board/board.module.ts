import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Board } from '../entities/board/board.entity';
import { User } from '../entities/user/user.entity';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Board])],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
