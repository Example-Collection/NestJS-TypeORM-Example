/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UserCreateDto } from '../user/dtos/create-user.dto';
import { UserService } from './user.service';
import { UserInfoResponseDto } from './dtos/user-info.dto';
import { UserUpdateDto } from './dtos/update-user.dto';
import { BasicMessageDto } from '../common/dtos/basic-message.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  saveUser(@Body() dto: UserCreateDto): Promise<UserInfoResponseDto> {
    return this.userService.saveUser(dto);
  }

  @Get('/:userId')
  getUserInfo(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserInfoResponseDto> {
    return this.userService.getUserInfo(userId);
  }

  @Patch('/:userId')
  updateUserInfo(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UserUpdateDto,
  ): Promise<BasicMessageDto> {
    return this.userService.updateUserInfo(userId, dto);
  }

  @Delete('/:userId')
  removeUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.removeUser(userId);
  }
}
