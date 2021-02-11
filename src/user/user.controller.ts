import { Body, Controller, Post, Put } from '@nestjs/common';
import { UserCreateDto } from 'src/user/dtos/create-user.dto';
import { UserUpdateDto } from 'src/user/dtos/update-user.dto';
import { UserInfoValidationPipe } from 'src/pipes/create-user.validation.pipe';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  // @Post()
  // async saveUser(
  //   @Body(new UserInfoValidationPipe()) dto: UserCreateDto,
  // ): Promise<UserCreateDto> {
  //   return this.userService.saveUser(dto);
  // }

  // @Put()
  // updateUser(@Body() dto: UserUpdateDto): UserUpdateDto {
  //   return this.userService.updateUser(dto);
  // }
}
