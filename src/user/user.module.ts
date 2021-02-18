import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAuthMiddleware } from '../middlewares/user-auth.middleware';
import { User } from '../entities/user/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Board } from '../entities/board/board.entity';
import { BoardService } from '../board/board.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Board])],
  controllers: [UserController],
  providers: [UserService, BoardService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserAuthMiddleware)
      .exclude(
        {
          path: 'user',
          method: RequestMethod.POST,
        },
        {
          path: 'user/login',
          method: RequestMethod.POST,
        },
      )
      .forRoutes(UserController);
  }
}
