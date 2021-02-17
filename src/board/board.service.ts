import { Injectable } from '@nestjs/common';
import { BoardRepository } from '../entities/board/board.repository';

@Injectable()
export class BoardService {
  constructor(private readonly boardRepository: BoardRepository) {}
}
