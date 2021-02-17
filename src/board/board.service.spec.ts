import { Board } from '../entities/board/board.entity';
import { Connection, Repository } from 'typeorm';
import { BoardService } from './board.service';
import { createMemoryDB } from '../utils/connections/create-memory-db';

describe('BoardService Logic test', () => {
  let boardService: BoardService;
  let connection: Connection;
  let boardRepository: Repository<Board>;

  beforeAll(async () => {
    connection = await createMemoryDB([Board]);
    boardRepository = await connection.getRepository(Board);
    boardService = new BoardService(boardRepository);
  });

  afterAll(async () => {
    await connection.close();
  });

  afterEach(async () => {
    await boardRepository.query('DELETE FROM boards');
  });

  it('should be defined', () => {
    expect(boardService).toBeDefined();
  });
});
