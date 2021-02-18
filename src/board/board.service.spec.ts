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
import { BoardUpdateDto } from './dtos/update-board.dto';

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
    return userRepository.save(savedUser);
  };

  const getBoardCreateDto = (): BoardCreateDto => {
    const dto = new BoardCreateDto();
    dto.content = CONTENT;
    dto.title = TITLE;
    return dto;
  };

  const saveBoard = async (): Promise<User> => {
    const savedUser = await saveUser();
    const board = new Board();
    board.setContent = CONTENT;
    board.setTitle = TITLE;
    board.user = savedUser;
    await boardRepository.save(board);
    return userRepository.findOne(savedUser.getUser_id, {
      relations: ['boards'],
    });
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
    expect(
      Date.now() > new Date(result.createdAt).getMilliseconds(),
    ).toBeTruthy();
    expect(
      Date.now() > new Date(result.lastModifiedAt).getMilliseconds(),
    ).toBeTruthy();
    expect(result.userId).toBe(savedUser.getUser_id);
    expect(result.name).toBe(savedUser.getName);

    const savedBoard = await boardRepository.findOne(result.boardId, {
      relations: ['user'],
    });
    expect(savedBoard.getBoard_id).toBe(result.boardId);
    expect(savedBoard.getContent).toBe(CONTENT);
    expect(savedBoard.getTitle).toBe(TITLE);
    expect(
      Date.now() > new Date(savedBoard.getCreatedAt).getMilliseconds(),
    ).toBeTruthy();
    expect(
      Date.now() > new Date(savedBoard.getLastModifiedAt).getMilliseconds(),
    ).toBeTruthy();
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

  it('updateBoard(): Should update only content', async () => {
    const savedUser = await saveBoard();
    const userId = savedUser.getUser_id;
    const boardId = savedUser.boards[0].getBoard_id;
    const requestDto = new BoardUpdateDto();
    requestDto.content = 'NEW_CONTENT';
    jest.setTimeout(500);
    await boardService.updateBoard(
      requestDto,
      generateAccessToken(userId),
      userId,
      boardId,
    );
    const updatedBoard = await boardRepository.findOne(boardId);
    expect(updatedBoard.getBoard_id).toBe(boardId);
    expect(updatedBoard.getContent).toBe('NEW_CONTENT');
    expect(updatedBoard.getTitle).toBe(TITLE);
  });

  it('updateBoard(): Should update only title', async () => {
    const savedUser = await saveBoard();
    const userId = savedUser.getUser_id;
    const boardId = savedUser.boards[0].getBoard_id;
    const requestDto = new BoardUpdateDto();
    requestDto.title = 'NEW_TITLE';
    jest.setTimeout(500);
    await boardService.updateBoard(
      requestDto,
      generateAccessToken(userId),
      userId,
      boardId,
    );
    const updatedBoard = await boardRepository.findOne(boardId);
    expect(updatedBoard.getBoard_id).toBe(boardId);
    expect(updatedBoard.getContent).toBe(CONTENT);
    expect(updatedBoard.getTitle).toBe('NEW_TITLE');
  });

  it('updateBoard(): Should update both title and content', async () => {
    const savedUser = await saveBoard();
    const userId = savedUser.getUser_id;
    const boardId = savedUser.boards[0].getBoard_id;
    const requestDto = new BoardUpdateDto();
    requestDto.title = 'NEW_TITLE';
    requestDto.content = 'NEW_CONTENT';
    await boardService.updateBoard(
      requestDto,
      generateAccessToken(userId),
      userId,
      boardId,
    );
    const updatedBoard = await boardRepository.findOne(boardId);
    expect(updatedBoard.getBoard_id).toBe(boardId);
    expect(updatedBoard.getContent).toBe('NEW_CONTENT');
    expect(updatedBoard.getTitle).toBe('NEW_TITLE');
  });

  it('updateBoard(): Should throw NotFoundException if userId is invalid', async () => {
    const requestDto = new BoardUpdateDto();
    requestDto.content = 'NEW_CONTENT';
    requestDto.title = 'NEW_TITLE';
    const savedUser = await saveBoard();
    const boardId = savedUser.boards[0].getBoard_id;
    expect.assertions(1);
    try {
      await boardService.updateBoard(
        requestDto,
        generateAccessToken(-1),
        -1,
        boardId,
      );
    } catch (exception) {
      expect(exception).toBeInstanceOf(NotFoundException);
    }
  });

  it('updateBoard(): Should throw ForbiddenException if userId is not owner of board', async () => {
    const savedUser = await saveBoard();
    const boardId = savedUser.boards[0].getBoard_id;
    let secondUser = new User();
    secondUser.setEmail = 'test2@test2.com';
    secondUser.setName = 'NAME';
    secondUser.setPassword = 'PASSWORD';
    secondUser = await userRepository.save(secondUser);
    const secondSavedUserId = secondUser.getUser_id;
    const requestDto = new BoardUpdateDto();
    requestDto.content = 'NEW_CONTENT';
    requestDto.title = 'NEW_TITLE';
    expect.assertions(1);
    try {
      await boardService.updateBoard(
        requestDto,
        generateAccessToken(secondSavedUserId),
        secondSavedUserId,
        boardId,
      );
    } catch (exception) {
      expect(exception).toBeInstanceOf(ForbiddenException);
    }
  });

  it('updateBoard(): Should throw ForbiddenException if userId in token and userId in path parameter is different.', async () => {
    const savedUser = await saveBoard();
    const boardId = savedUser.boards[0].getBoard_id;
    expect.assertions(1);
    const requestDto = new BoardUpdateDto();
    requestDto.content = 'NEW_CONTENT';
    try {
      await boardService.updateBoard(
        requestDto,
        generateAccessToken(-1),
        savedUser.getUser_id,
        boardId,
      );
    } catch (exception) {
      expect(exception).toBeInstanceOf(ForbiddenException);
    }
  });

  it('updateBoard(): Should throw UnauthorizedException if token is wrong', async () => {
    const savedUser = await saveBoard();
    const boardId = savedUser.boards[0].getBoard_id;
    expect.assertions(1);
    const requestDto = new BoardUpdateDto();
    requestDto.content = 'NEW_CONTENT';
    try {
      await boardService.updateBoard(
        requestDto,
        WRONG_TOKEN,
        savedUser.getUser_id,
        boardId,
      );
    } catch (exception) {
      expect(exception).toBeInstanceOf(UnauthorizedException);
    }
  });

  it('updateBoard(): Should throw ForbiddenException if board owner is not userId', async () => {
    let wrongUser = new User();
    wrongUser.setEmail = 'test2@test2.com';
    wrongUser.setName = 'NAME';
    wrongUser.setPassword = 'PASSWORD';
    wrongUser = await userRepository.save(wrongUser);
    const wrongUserId = wrongUser.getUser_id;
    const boardId = (await saveBoard()).boards[0].getBoard_id;
    const requestDto = new BoardUpdateDto();
    requestDto.content = 'NEW_CONTENT';
    expect.assertions(1);
    try {
      await boardService.updateBoard(
        requestDto,
        generateAccessToken(wrongUserId),
        wrongUserId,
        boardId,
      );
    } catch (exception) {
      expect(exception).toBeInstanceOf(ForbiddenException);
    }
  });

  it('removeBoard(): Should successfully remove', async () => {
    const savedUser = await saveBoard();
    const boardId = savedUser.boards[0].getBoard_id;
    await boardService.removeBoard(
      generateAccessToken(savedUser.getUser_id),
      savedUser.getUser_id,
      boardId,
    );
    const board = await boardRepository.findOne(boardId);
    expect(board).toBeUndefined();
  });

  it('removeBoard(): Should throw UnAuthorizedException if token is wrong', async () => {
    const savedUser = await saveBoard();
    const boardId = savedUser.boards[0].getBoard_id;
    expect.assertions(1);
    try {
      await boardService.removeBoard(
        WRONG_TOKEN,
        savedUser.getUser_id,
        boardId,
      );
    } catch (exception) {
      expect(exception).toBeInstanceOf(UnauthorizedException);
    }
  });

  it('removeBoard(): Should throw NotFoundException if userId is invalid', async () => {
    const boardId = (await saveBoard()).boards[0].getBoard_id;
    expect.assertions(1);
    try {
      await boardService.removeBoard(generateAccessToken(-1), -1, boardId);
    } catch (exception) {
      expect(exception).toBeInstanceOf(NotFoundException);
    }
  });

  it('removeBoard(): Should throw ForbiddenException if userId is not owner of boardId', async () => {
    let wrongUser = new User();
    wrongUser.setEmail = 'test2@test2.com';
    wrongUser.setName = 'NAME';
    wrongUser.setPassword = 'PASSWORD';
    wrongUser = await userRepository.save(wrongUser);
    const wrongUserId = wrongUser.getUser_id;
    const boardId = (await saveBoard()).boards[0].getBoard_id;
    expect.assertions(1);
    try {
      await boardService.removeBoard(
        generateAccessToken(wrongUserId),
        wrongUserId,
        boardId,
      );
    } catch (exception) {
      expect(exception).toBeInstanceOf(ForbiddenException);
    }
  });

  it('removeBoard(): Should throw ForbiddenException if userId in token and path parameter is different', async () => {
    expect.assertions(1);
    try {
      await boardService.removeBoard(generateAccessToken(-1), 1, 1);
    } catch (exception) {
      expect(exception).toBeInstanceOf(ForbiddenException);
    }
  });
});
