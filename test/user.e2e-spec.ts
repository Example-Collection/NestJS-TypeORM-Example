import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../src/entities/user/user.entity';
import { UserCreateDto } from '../src/user/dtos/create-user.dto';
import { UserModule } from '../src/user/user.module';
import { UserService } from '../src/user/user.service';
import { Repository } from 'typeorm';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationPipe } from '@nestjs/common';
import { generateAccessToken } from '../src/utils/auth/jwt-token-util';
import { UserUpdateDto } from '../src/user/dtos/update-user.dto';
import { Board } from '../src/entities/board/board.entity';
import { BoardService } from '../src/board/board.service';
import { BoardCreateDto } from '../src/board/dtos/create-board-dto';
import { BoardInfoResponseDto } from '../src/board/dtos/board-info.dto';
import { UserInfoResponseDto } from '../src/user/dtos/user-info.dto';
import { BoardUpdateDto } from '../src/board/dtos/update-board.dto';

describe('UserController (e2e)', () => {
  let userService: UserService;
  let boardService: BoardService;
  let userRepository: Repository<User>;
  let boardRepository: Repository<Board>;
  let app: INestApplication;
  const NAME = 'NAME';
  const EMAIL = 'test@test.com';
  const PASSWORD = '12345asbcd';
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
    dto.title = TITLE;
    dto.content = CONTENT;
    return dto;
  };

  const getBoardUpdateDto = (): BoardUpdateDto => {
    const dto = new BoardUpdateDto();
    dto.title = 'NEW_TITLE';
    dto.content = 'NEW_CONTENT';
    return dto;
  };

  const assertThatBoardIsNotSaved = async (userId: number): Promise<void> => {
    const checkUser = await userRepository.findOne(userId, {
      relations: ['boards'],
    });
    expect(checkUser.boards.length).toBe(0);
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
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [User, Board],
          logging: false,
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    userRepository = moduleFixture.get('UserRepository');
    boardRepository = moduleFixture.get('BoardRepository');
    userService = new UserService(userRepository);
    boardService = new BoardService(boardRepository, userRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await boardRepository.query('DELETE FROM boards');
    await userRepository.query('DELETE FROM users');
  });

  it('[POST] /user : Response is OK if conditions are right', async () => {
    const dto = new UserCreateDto();
    dto.name = NAME;
    dto.email = EMAIL;
    dto.password = PASSWORD;
    const result = await request(app.getHttpServer())
      .post('/user')
      .send(dto)
      .expect(HttpStatus.CREATED);

    const response = result.body as UserInfoResponseDto;
    expect(response.email).toBe(EMAIL);
    expect(response.name).toBe(NAME);
    expect(typeof response.user_id).toBe('number');
  });

  it('[POST] /user: Response is BAD_REQUEST if email is missing', async () => {
    const dto = new UserCreateDto();
    dto.name = NAME;
    dto.password = PASSWORD;
    const result = await request(app.getHttpServer()).post('/user').send(dto);
    expect(result.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[POST] /user: Response is BAD_REQUEST if name is missing', async () => {
    const dto = new UserCreateDto();
    dto.email = EMAIL;
    dto.password = PASSWORD;
    const result = await request(app.getHttpServer()).post('/user').send(dto);
    expect(result.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[POST] /user: Response is BAD_REQUEST if password is missing', async () => {
    const dto = new UserCreateDto();
    dto.email = EMAIL;
    dto.name = NAME;
    const result = await request(app.getHttpServer()).post('/user').send(dto);
    expect(result.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[POST] /user: Response is BAD_REQUEST if email is not type of email', async () => {
    const dto = new UserCreateDto();
    dto.email = 'NOT_FORM_OF_EMAIL';
    dto.name = NAME;
    dto.password = PASSWORD;
    const result = await request(app.getHttpServer()).post('/user').send(dto);
    expect(result.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[POST] /user: Response is CONFLICT if email already exists.', async () => {
    await saveUser();
    const dto = new UserCreateDto();
    dto.email = EMAIL;
    dto.name = NAME;
    dto.password = PASSWORD;
    const result = await request(app.getHttpServer()).post('/user').send(dto);
    expect(result.status).toBe(HttpStatus.CONFLICT);
  });

  it('[GET] /user/{userId} : Response is OK if userId exists.', async () => {
    const savedUser = await saveUser();
    const userId = savedUser.getUser_id;
    const token = generateAccessToken(userId);
    const result = await request(app.getHttpServer())
      .get(`/user/${userId}`)
      .set('authorization', `Bearer ${token}`);
    expect(result.status).toBe(HttpStatus.OK);

    const response = result.body as UserInfoResponseDto;
    expect(response.user_id).toBe(userId);
    expect(response.email).toBe(EMAIL);
    expect(response.name).toBe(NAME);
  });

  it('[GET] /user/{userId} : Response is NOT_FOUND if userId does not exist', async () => {
    const token = generateAccessToken(-1);
    const result = await request(app.getHttpServer())
      .get('/user/-1')
      .set('authorization', `Bearer ${token}`);
    expect(result.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[GET] /user/{userId} : Response is BAD_REQUEST if authorization header is missing', async () => {
    const result = await request(app.getHttpServer()).get('/user/-1');
    expect(result.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[GET] /user/{userId} : Response is FORBIDDEN if userId in token and userId in path parmaeter is different', async () => {
    const savedUser = await saveUser();
    const userId = savedUser.getUser_id;
    const token = generateAccessToken(-1);
    const result = await request(app.getHttpServer())
      .get(`/user/${userId}`)
      .set('authorization', `Bearer ${token}`);
    expect(result.status).toBe(HttpStatus.FORBIDDEN);
  });

  it('[GET] /user/{userId} : Response is UNAUTHOZIRED if token is malformed', async () => {
    const savedUser = await saveUser();
    savedUser.setPassword = PASSWORD;
    const userId = savedUser.getUser_id;
    const result = await request(app.getHttpServer())
      .get(`/user/${userId}`)
      .set('authorization', `Bearer ${WRONG_TOKEN}`);
    expect(result.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[PUT] /user/{userId} : Response is OK if all conditions are right', async () => {
    const savedUser = await saveUser();
    const userId = savedUser.getUser_id;

    const token = generateAccessToken(userId);
    const updateDto = new UserUpdateDto();
    updateDto.name = 'NEW_NAME';
    updateDto.password = 'NEW_PASSWORD';

    const result = await request(app.getHttpServer())
      .put(`/user/${userId}`)
      .set('authorization', `Bearer ${token}`)
      .send(updateDto);

    expect(result.status).toBe(HttpStatus.OK);
    const updatedUser = await userRepository.findOne(userId);
    expect(updatedUser.getName).toBe('NEW_NAME');
    expect(updatedUser.getPassword).toBe('NEW_PASSWORD');
  });

  it('[PUT] /user/{userId} : Response is UNAUTHOZIRED if token is malformed.', async () => {
    const result = await request(app.getHttpServer())
      .put(`/user/-1`)
      .set('authorization', `Bearer ${WRONG_TOKEN}`);
    expect(result.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[PUT] /user/{userId} : Response is FORBIDDEN if userId in token and userId in path parameter is different', async () => {
    const savedUser = await saveUser();
    const userId = savedUser.getUser_id;

    const token = generateAccessToken(-1);
    const updateDto = new UserUpdateDto();
    updateDto.name = 'NEW_NAME';
    updateDto.password = 'NEW_PASSWORD';

    const result = await request(app.getHttpServer())
      .put(`/user/${userId}`)
      .set('authorization', `Bearer ${token}`)
      .send(updateDto);
    expect(result.status).toBe(HttpStatus.FORBIDDEN);

    const updatedUser = await userRepository.findOne(userId);
    expect(updatedUser.getName).toBe(NAME);
    expect(updatedUser.getPassword).toBe(PASSWORD);
  });

  it('[PUT] /user/{userId} : Response is BAD_REQUEST if authorization header is missing', async () => {
    const savedUser = await saveUser();
    const userId = savedUser.getUser_id;

    const updateDto = new UserUpdateDto();
    updateDto.name = 'NEW_NAME';
    updateDto.password = 'NEW_PASSWORD';

    const result = await request(app.getHttpServer())
      .put(`/user/${userId}`)
      .send(updateDto);
    expect(result.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[DELETE] /user/{userId} : Response is OK if all conditions are right', async () => {
    const savedUser = await saveUser();
    const userId = savedUser.getUser_id;
    const token = generateAccessToken(userId);
    const result = await request(app.getHttpServer())
      .delete(`/user/${userId}`)
      .set('authorization', `Bearer ${token}`);
    expect(result.status).toBe(HttpStatus.OK);

    expect(await userRepository.findOne(userId)).toBeUndefined();
  });

  it('[DELETE] /user/{userId} : Response is BAD_REQUEST if authorization header is missing', async () => {
    const savedUser = await saveUser();
    const userId = savedUser.getUser_id;
    const result = await request(app.getHttpServer()).delete(`/user/${userId}`);
    expect(result.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[DELETE] /user/{userId} : Response is FORBIDDEN if userId in token and userId in path parameter is different', async () => {
    const savedUser = await saveUser();
    const userId = savedUser.getUser_id;
    const token = generateAccessToken(-1);
    const result = await request(app.getHttpServer())
      .delete(`/user/${userId}`)
      .set('authorization', `Bearer ${token}`);
    expect(result.status).toBe(HttpStatus.FORBIDDEN);
  });

  it('[DELETE] /user/{userId} : Response is UNAUTHORIZED if token is malformed', async () => {
    const savedUser = await saveUser();
    const userId = savedUser.getUser_id;
    const result = await request(app.getHttpServer())
      .delete(`/user/${userId}`)
      .set('authorization', `Bearer ${WRONG_TOKEN}`);
    expect(result.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[POST] /user/board/{userId} : Response is OK if all conditions are right', async () => {
    const dto = getBoardCreateDto();
    const savedUser = await saveUser();
    const userId = savedUser.getUser_id;
    const token = generateAccessToken(userId);
    const result = await request(app.getHttpServer())
      .post(`/user/board/${userId}`)
      .set('authorization', `Bearer ${token}`)
      .send(dto);
    expect(result.status).toBe(HttpStatus.CREATED);
    const response = result.body as BoardInfoResponseDto;
    expect(typeof response.boardId).toBe('number');
    expect(response.title).toBe(TITLE);
    expect(response.content).toBe(CONTENT);
    expect(
      Date.now() > new Date(response.createdAt).getMilliseconds(),
    ).toBeTruthy();
    expect(
      Date.now() > new Date(response.lastModifiedAt).getMilliseconds(),
    ).toBeTruthy();
    expect(response.userId).toBe(userId);
    expect(response.name).toBe(NAME);
  });

  it('[POST] /user/board/{userId} : Response is NOT_FOUND if userId is invalid', async () => {
    const dto = getBoardCreateDto();
    const token = generateAccessToken(-1);
    const result = await request(app.getHttpServer())
      .post(`/user/board/-1`)
      .set('authorization', `Bearer ${token}`)
      .send(dto);
    expect(result.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[POST] /user/board/{userId} : Response is UNAUTHORIZED if token is malformed', async () => {
    const dto = getBoardCreateDto();
    const result = await request(app.getHttpServer())
      .post(`/user/board/-1`)
      .set('authorization', `Bearer ${WRONG_TOKEN}`)
      .send(dto);
    expect(result.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[POST] /user/board/{userId} : Response is FORBIDDEN if userId in token and userId in path parameter is different', async () => {
    const dto = getBoardCreateDto();
    const savedUser = await saveUser();
    const token = generateAccessToken(-1);
    const result = await request(app.getHttpServer())
      .post(`/user/board/${savedUser.getUser_id}`)
      .set('authorization', `Bearer ${token}`)
      .send(dto);
    expect(result.status).toBe(HttpStatus.FORBIDDEN);
    await assertThatBoardIsNotSaved(savedUser.getUser_id);
  });

  it('[POST] /user/board/{userId} : Response is BAD_REQUEST if authorization header is missing', async () => {
    const dto = getBoardCreateDto();
    const savedUser = await saveUser();
    const result = await request(app.getHttpServer())
      .post(`/user/board/${savedUser.getUser_id}`)
      .send(dto);
    expect(result.status).toBe(HttpStatus.BAD_REQUEST);
    await assertThatBoardIsNotSaved(savedUser.getUser_id);
  });

  it('[PATCH] /user/board/{userId}/{boardId} : Response is OK if all conditions are right', async () => {
    const savedUser = await saveBoard();
    const userId = savedUser.getUser_id;
    const boardId = savedUser.boards[0].getBoard_id;
    const dto = getBoardUpdateDto();
    const result = await request(app.getHttpServer())
      .patch(`/user/board/${userId}/${boardId}`)
      .set('authorization', `Bearer ${generateAccessToken(userId)}`)
      .send(dto);

    expect(result.status).toBe(HttpStatus.OK);
    const updatedBoard = await boardRepository.findOne(boardId);
    expect(updatedBoard.getBoard_id).toBe(boardId);
    expect(updatedBoard.getContent).toBe('NEW_CONTENT');
    expect(updatedBoard.getTitle).toBe('NEW_TITLE');
  });

  it('[PATCH] /user/board/{userId}/{boardId} : Response is UNAUTHORIZED if token is malformed', async () => {
    const savedUser = await saveBoard();
    const userId = savedUser.getUser_id;
    const boardId = savedUser.boards[0].getBoard_id;
    const dto = getBoardUpdateDto();
    const result = await request(app.getHttpServer())
      .patch(`/user/board/${userId}/${boardId}`)
      .set('authorization', `Bearer ${WRONG_TOKEN}`)
      .send(dto);

    expect(result.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[PATCH] /user/board/{userId}/{boardId} : Response is BAD_REQUEST if authorization header is missing', async () => {
    const savedUser = await saveBoard();
    const userId = savedUser.getUser_id;
    const boardId = savedUser.boards[0].getBoard_id;
    const dto = getBoardUpdateDto();
    const result = await request(app.getHttpServer())
      .patch(`/user/board/${userId}/${boardId}`)
      .send(dto);

    expect(result.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[PATCH] /user/board/{userId}/{boardId} : Response is NOT_FOUND if userId is invalid', async () => {
    const savedUser = await saveBoard();
    const boardId = savedUser.boards[0].getBoard_id;
    const dto = getBoardUpdateDto();
    const result = await request(app.getHttpServer())
      .patch(`/user/board/-1/${boardId}`)
      .set('authorization', `Bearer ${generateAccessToken(-1)}`)
      .send(dto);

    expect(result.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[PATCH] /user/board/{userId}/{boardId} : Response is FORBIDDEN if userId in token and path parameter is different', async () => {
    const savedUser = await saveBoard();
    const userId = savedUser.getUser_id;
    const boardId = savedUser.boards[0].getBoard_id;
    const dto = getBoardUpdateDto();
    const result = await request(app.getHttpServer())
      .patch(`/user/board/-1/${boardId}`)
      .set('authorization', `Bearer ${generateAccessToken(userId)}`)
      .send(dto);

    expect(result.status).toBe(HttpStatus.FORBIDDEN);
  });

  it('[PATCH] /user/board/{userId}/{boardId} : Response is FORBIDDEN if userId is not owner of boardId', async () => {
    let wrongUser = new User();
    wrongUser.setEmail = 'test2@test2.com';
    wrongUser.setName = 'NAME';
    wrongUser.setPassword = 'PASSWORD';
    wrongUser = await userRepository.save(wrongUser);
    const wrongUserId = wrongUser.getUser_id;
    const boardId = (await saveBoard()).boards[0].getBoard_id;
    const dto = getBoardUpdateDto();
    const result = await request(app.getHttpServer())
      .patch(`/user/board/${wrongUserId}/${boardId}`)
      .set('authorization', `Bearer ${generateAccessToken(wrongUserId)}`)
      .send(dto);

    expect(result.status).toBe(HttpStatus.FORBIDDEN);
  });
});
