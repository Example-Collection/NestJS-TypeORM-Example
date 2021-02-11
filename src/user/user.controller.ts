/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UserCreateDto } from 'src/user/dtos/user/create-user.dto';
import { UserInfoValidationPipe } from 'src/pipes/create-user.validation.pipe';
import { UserService } from './user.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UserInfoResponseDto } from './dtos/user/user-info.dto';
import { UserUpdateDto } from './dtos/user/update-user.dto';
import { BasicMessageDto } from './dtos/common/basic-message.dto';

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

  @Patch('/:userId')
  updateUserInfo(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UserUpdateDto,
  ): Promise<BasicMessageDto> {
    return this.userService.updateUserInfo(userId, dto);
  }
}
