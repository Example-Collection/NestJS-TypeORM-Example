import { Body, Controller, Post } from '@nestjs/common';
import { UserCreateDto } from 'src/dtos/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post()
  saveUser(@Body() dto: UserCreateDto): string {
    return this.userService.saveUser(dto);
  }
}
