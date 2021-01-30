import { Body, Controller, Post } from '@nestjs/common';
import { UserCreateDto } from 'src/dtos/create-user.dto';
import { UserInfoValidationPipe } from 'src/pipes/create-user.validation.pipe';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post()
  saveUser(@Body(new UserInfoValidationPipe()) dto: UserCreateDto): string {
    return this.userService.saveUser(dto);
  }
}
