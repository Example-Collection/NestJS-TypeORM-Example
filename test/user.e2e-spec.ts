import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../src/entities/user.entity';
import { UserCreateDto } from '../src/user/dtos/create-user.dto';
import { UserModule } from '../src/user/user.module';
import { UserService } from '../src/user/user.service';
import { Repository } from 'typeorm';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationPipe } from '@nestjs/common';

describe('UserController (e2e)', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  let app: INestApplication;
  const NAME = 'NAME';
  const EMAIL = 'test@test.com';
  const PASSWORD = '12345asbcd';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,

        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User],
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
    userService = new UserService(userRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
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

    const userId = (await userRepository.findOne()).getUser_id;
    expect(JSON.stringify(result.body)).toBe(
      JSON.stringify(await userService.getUserInfo(userId)),
    );
  });

  it('[POST] /user: Response is BAD_REQUEST if email is missing', async () => {
    const dto = new UserCreateDto();
    dto.name = NAME;
    dto.password = PASSWORD;
    const result = await request(app.getHttpServer()).post('/user').send(dto);
    expect(result.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('POST] /user: Response is BAD_REQUEST if name is missing', async () => {
    const dto = new UserCreateDto();
    dto.email = EMAIL;
    dto.password = PASSWORD;
    const result = await request(app.getHttpServer()).post('/user').send(dto);
    expect(result.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('POST] /user: Response is BAD_REQUEST if password is missing', async () => {
    const dto = new UserCreateDto();
    dto.email = EMAIL;
    dto.name = NAME;
    const result = await request(app.getHttpServer()).post('/user').send(dto);
    expect(result.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('POST] /user: Response is BAD_REQUEST if email is not type of email', async () => {
    const dto = new UserCreateDto();
    dto.email = 'NOT_FORM_OF_EMAIL';
    dto.name = NAME;
    dto.password = PASSWORD;
    const result = await request(app.getHttpServer()).post('/user').send(dto);
    expect(result.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[POST] /user: Response is CONFLICT if email already exists.', async () => {
    const savedUser = new User();
    savedUser.setEmail = EMAIL;
    savedUser.setName = NAME;
    savedUser.setPassword = PASSWORD;
    await userRepository.save(savedUser);

    const dto = new UserCreateDto();
    dto.email = EMAIL;
    dto.name = NAME;
    dto.password = PASSWORD;
    const result = await request(app.getHttpServer()).post('/user').send(dto);
    expect(result.status).toBe(HttpStatus.CONFLICT);
  });

  it('[GET] /user/{userId} : Response is OK if userId exists.', async () => {
    const savedUser = new User();
    savedUser.setEmail = EMAIL;
    savedUser.setName = NAME;
    savedUser.setPassword = PASSWORD;
    const userId = (await userRepository.save(savedUser)).getUser_id;

    const result = await request(app.getHttpServer()).get(`/user/${userId}`);
    expect(result.status).toBe(HttpStatus.OK);
    expect(JSON.stringify(result.body)).toBe(
      JSON.stringify(await userService.getUserInfo(userId)),
    );
  });

  it('[GET] /user/{userId} : Response is NOT_FOUND if userId does not exist', async () => {
    const result = await request(app.getHttpServer()).get('/user/-1');
    expect(result.status).toBe(HttpStatus.NOT_FOUND);
  });
});
