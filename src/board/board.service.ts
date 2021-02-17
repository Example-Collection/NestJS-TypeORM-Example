import { Injectable } from '@nestjs/common';
import { UserRepository } from '../entities/user/user.repository';
import { BoardRepository } from '../entities/board/board.repository';

@Injectable()
export class BoardService {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly userRepository: UserRepository,
  ) {}
}
