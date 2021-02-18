import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../entities/user/user.repository';
import { BoardRepository } from '../entities/board/board.repository';
import { BoardCreateDto } from './dtos/create-board-dto';
import { BoardInfoResponseDto } from './dtos/board-info.dto';
import { extractUserId } from '../utils/auth/jwt-token-util';
import { Board } from '../entities/board/board.entity';
import { BoardUpdateDto } from './dtos/update-board.dto';
import { BasicMessageDto } from 'src/common/dtos/basic-message.dto';

@Injectable()
export class BoardService {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly userRepository: UserRepository,
  ) {}

  // TODO : Paging 처리해서 가져오기(Token 불필요)

  async saveBoard(
    dto: BoardCreateDto,
    token: string,
    userId: number,
  ): Promise<BoardInfoResponseDto> {
    if (userId !== extractUserId(token)) {
      throw new ForbiddenException(
        'userId in parameter and token is different.',
      );
    }
    const user = await this.userRepository.findOne(userId);
    if (!!user) {
      const board = new Board();
      board.setContent = dto.content;
      board.setTitle = dto.title;
      board.user = user;
      const savedBoard = await this.boardRepository.save(board);
      return new BoardInfoResponseDto(user, savedBoard);
    } else throw new NotFoundException('UserId is invalid.');
  }

  async updateBoard(
    dto: BoardUpdateDto,
    token: string,
    userId: number,
    boardId: number,
  ): Promise<BasicMessageDto> {
    if (userId !== extractUserId(token)) {
      throw new ForbiddenException('userId in paramter and token is different');
    }
    const user = await this.userRepository.findOne(userId, {
      relations: ['boards'],
    });
    if (!!user) {
      const board = user.boards.filter(
        (board) => board.getBoard_id === boardId,
      )[0];
      if (!!board) {
        const result = await this.boardRepository
          .createQueryBuilder()
          .select()
          .update('boards', { ...dto })
          .where('board_id = :boardId', { boardId })
          .execute();
        if (result.affected !== 0) {
          return new BasicMessageDto('Updated Successfully.');
        } else throw new InternalServerErrorException('Something went wrong,,');
      } else
        throw new ForbiddenException(
          'User of userId is not owner of this board.',
        );
    }
  }
}
