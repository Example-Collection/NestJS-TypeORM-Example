import { Board } from '../entities/board/board.entity';
import { Connection, Repository } from 'typeorm';
import { BoardService } from './board.service';
import { createMemoryDB } from '../utils/connections/create-memory-db';
import { User } from '../entities/user/user.entity';
import { BoardCreateDto } from './dtos/create-board-dto';
import { generateAccessToken } from '../utils/auth/jwt-token-util';
import { BoardInfoResponseDto } from './dtos/board-info.dto';

describe('BoardService Logic test', () => {
  let boardService: BoardService;
  let connection: Connection;
  let userRepository: Repository<User>;
  let boardRepository: Repository<Board>;

  const NAME = 'NAME';
  const EMAIL = 'test@test.com';
  const PASSWORD = '1234abc5';
  const WRONG_TOKEN = 'asdfasdf';
  const TITLE = 'THIS IS TITLE';
  const CONTENT = 'THIS IS CONTENT';

  const saveUser = async (): Promise<User> => {
    const savedUser = new User();
    savedUser.setEmail = EMAIL;
    savedUser.setName = NAME;
    savedUser.setPassword = PASSWORD;
    return await userRepository.save(savedUser);
  };

  beforeAll(async () => {
    connection = await createMemoryDB([User, Board]);
    userRepository = await connection.getRepository(User);
    boardRepository = await connection.getRepository(Board);
    boardService = new BoardService(boardRepository, userRepository);
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

  it('Should save board', async () => {
    const savedUser = await saveUser();
    const requestDto = new BoardCreateDto();
    requestDto.content = CONTENT;
    requestDto.title = TITLE;
    const result = await boardService.saveBoard(
      requestDto,
      generateAccessToken(savedUser.getUser_id),
      savedUser.getUser_id,
    );
    expect(result).toBeInstanceOf(BoardInfoResponseDto);
    expect(result.content).toBe(CONTENT);
    expect(result.title).toBe(TITLE);
    expect(new Date() > result.createdAt).toBeTruthy();
    expect(new Date() > result.lastModifiedAt).toBeTruthy();
    expect(result.userId).toBe(savedUser.getUser_id);
    expect(result.name).toBe(savedUser.getName);

    const savedBoard = await boardRepository.findOne(result.boardId, {
      relations: ['user'],
    });
    expect(savedBoard.getBoard_id).toBe(result.boardId);
    expect(savedBoard.getContent).toBe(CONTENT);
    expect(savedBoard.getTitle).toBe(TITLE);
    expect(new Date() > savedBoard.getCreatedAt);
    expect(new Date() > savedBoard.getLastModifiedAt);
    expect(savedBoard.user.getUser_id).toBe(savedUser.getUser_id);
    console.log(savedBoard);
  });
});
