/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardInfoResponseDto } from './dtos/board-info.dto';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get('/:boardId')
  getByBoardId(
    @Param('boardId') boardId: number,
  ): Promise<BoardInfoResponseDto> {
    return this.boardService.getByBoardId(boardId);
  }

  @Get('')
  getBoards(
    @Query('page') page: number,
    @Query('size') size: number,
  ): Promise<BoardInfoResponseDto[]> {
    return this.boardService.getBoards(page, size);
  }
}
