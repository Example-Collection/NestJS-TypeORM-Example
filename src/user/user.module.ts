import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAuthMiddleware } from '../middlewares/user-auth.middleware';
import { User } from '../entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
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
