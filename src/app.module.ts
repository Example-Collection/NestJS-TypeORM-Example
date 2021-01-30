import { Module } from '@nestjs/common';
import { MoviesController } from './movies/movies.controller';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

@Module({
  imports: [],
  controllers: [MoviesController, UserController],
  providers: [UserService],
})
export class AppModule {}
