import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { UserCreateDto } from 'src/user/dtos/create-user.dto';
import { UserInfoValidationPipe } from 'src/pipes/create-user.validation.pipe';
import { UserService } from './user.service';
import { UserInfoResponseDto } from './dtos/user-info.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  saveUser(
    @Body(new UserInfoValidationPipe()) dto: UserCreateDto,
  ): Promise<UserInfoResponseDto> {
    return this.userService.saveUser(dto);
  }

  @Get('/:userId')
  getUserInfo(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserInfoResponseDto> {
    return this.userService.getUserInfo(userId);
  }

  // @Put()
  // updateUser(@Body() dto: UserUpdateDto): UserUpdateDto {
  //   return this.userService.updateUser(dto);
  // }
}
