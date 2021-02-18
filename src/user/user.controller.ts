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
  Put,
  Req,
} from '@nestjs/common';
import { UserCreateDto } from '../user/dtos/create-user.dto';
import { UserService } from './user.service';
import { UserInfoResponseDto } from './dtos/user-info.dto';
import { UserUpdateDto } from './dtos/update-user.dto';
import { BasicMessageDto } from '../common/dtos/basic-message.dto';
import { UserLoginRequestDto } from './dtos/user-login-request.dto';
import { UserLoginResponseDto } from './dtos/user-login-response.dto';
import IUserRequest from '../interfaces/user-request';
import { BoardCreateDto } from '../board/dtos/create-board-dto';
import { BoardInfoResponseDto } from '../board/dtos/board-info.dto';
import { BoardService } from '../board/board.service';
import { BoardUpdateDto } from '../board/dtos/update-board.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly boardSerive: BoardService,
  ) {}

  @Post()
  saveUser(@Body() dto: UserCreateDto): Promise<UserInfoResponseDto> {
    return this.userService.saveUser(dto);
  }

  @Get('/:userId')
  getUserInfo(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: IUserRequest,
  ): Promise<UserInfoResponseDto> {
    return this.userService.getUserInfo(userId, req.accessToken);
  }

  @Put('/:userId')
  updateUserInfo(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UserUpdateDto,
    @Req() req: IUserRequest,
  ): Promise<BasicMessageDto> {
    return this.userService.updateUserInfo(userId, dto, req.accessToken);
  }

  @Delete('/:userId')
  removeUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: IUserRequest,
  ) {
    return this.userService.removeUser(userId, req.accessToken);
  }

  @Post('/login')
  login(@Body() dto: UserLoginRequestDto): Promise<UserLoginResponseDto> {
    return this.userService.login(dto);
  }

  @Post('/board/:userId')
  saveBoard(
    @Body() dto: BoardCreateDto,
    @Req() req: IUserRequest,
    @Param('userId') userId: number,
  ): Promise<BoardInfoResponseDto> {
    return this.boardSerive.saveBoard(dto, req.accessToken, userId);
  }

  @Patch('/board/:userId/:boardId')
  updateBoard(
    @Body() dto: BoardUpdateDto,
    @Req() req: IUserRequest,
    @Param('userId') userId: number,
    @Param('boardId') boardId: number,
  ): Promise<BasicMessageDto> {
    return this.boardSerive.updateBoard(dto, req.accessToken, userId, boardId);
  }

  @Delete('/board/:userId/:boardId')
  removeBoard(
    @Req() req: IUserRequest,
    @Param('userId') userId: number,
    @Param('boardId') boardId: number,
  ): Promise<BasicMessageDto> {
    return this.boardSerive.removeBoard(req.accessToken, userId, boardId);
  }
}
