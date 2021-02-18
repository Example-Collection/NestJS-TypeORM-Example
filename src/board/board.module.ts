import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { Board } from '../entities/board/board.entity';
import { User } from '../entities/user/user.entity';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { UserAuthMiddleware } from '../middlewares/user-auth.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([User, Board])],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserAuthMiddleware)
      .exclude({
        path: 'board',
        method: RequestMethod.GET,
      })
      .forRoutes(BoardController);
  }
}
