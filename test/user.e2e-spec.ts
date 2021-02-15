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
          logging: true,
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
});
