import { Board } from '../entities/board/board.entity';
import { Connection, Repository } from 'typeorm';
import { BoardService } from './board.service';
import { createMemoryDB } from '../utils/connections/create-memory-db';
import { User } from '../entities/user/user.entity';
import { BoardCreateDto } from './dtos/create-board-dto';
import { generateAccessToken } from '../utils/auth/jwt-token-util';
import { BoardInfoResponseDto } from './dtos/board-info.dto';
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { request } from 'express';

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

  const getBoardCreateDto = (): BoardCreateDto => {
    const dto = new BoardCreateDto();
    dto.content = CONTENT;
    dto.title = TITLE;
    return dto;
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
    await userRepository.query('DELETE FROM users');
  });

  it('should be defined', () => {
    expect(boardService).toBeDefined();
  });

  it('saveBoard(): Should save board', async () => {
    const savedUser = await saveUser();
    const requestDto = getBoardCreateDto();
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
  });

  it('saveBoard(): Should throw NotFoundException if userId is invalid', async () => {
    const requestDto = getBoardCreateDto();
    expect.assertions(1);
    try {
      await boardService.saveBoard(requestDto, generateAccessToken(-1), -1);
    } catch (exception) {
      expect(exception).toBeInstanceOf(NotFoundException);
    }
  });

  it('saveBoard(): Should throw UnauthorizedException if token is wrong', async () => {
    const savedUser = await saveUser();
    expect.assertions(1);
    const requestDto = getBoardCreateDto();
    try {
      await boardService.saveBoard(
        requestDto,
        WRONG_TOKEN,
        savedUser.getUser_id,
      );
    } catch (exception) {
      expect(exception).toBeInstanceOf(UnauthorizedException);
    }
  });

  it('saveBoard(): Should throw ForbiddenException if userId in token and userId in path parameter is different.', async () => {
    const savedUser = await saveUser();
    expect.assertions(1);
    const requestDto = getBoardCreateDto();
    try {
      await boardService.saveBoard(
        requestDto,
        generateAccessToken(-1),
        savedUser.getUser_id,
      );
    } catch (exception) {
      expect(exception).toBeInstanceOf(ForbiddenException);
    }
  });
});
