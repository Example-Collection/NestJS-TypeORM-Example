import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../src/entities/user.entity';
import { UserCreateDto } from '../src/user/dtos/create-user.dto';
import { UserModule } from '../src/user/user.module';
import { UserService } from '../src/user/user.service';
// import { createMemoryDB } from '../src/utils/create-memory-db';
import { Repository } from 'typeorm';
import * as request from 'supertest';
// import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { response } from 'express';
import { UserInfoResponseDto } from '../src/user/dtos/user-info.dto';

describe('UserController (e2e)', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  //   let connection: Connection;
  let app: INestApplication;
  const NAME = 'NAME';
  const EMAIL = 'test@test.com';
  const PASSWORD = '12345asbcd';

  beforeAll(async () => {
    // connection = await createMemoryDB([User]);
    // userRepository = await connection.getRepository(User);
    // userService = new UserService(userRepository);

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
    await app.init();
    userRepository = moduleFixture.get('UserRepository');
    userService = new UserService(userRepository);
  });

  afterAll(async () => {
    // await connection.close();
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
    console.log(dto);
    console.log(JSON.stringify(dto));
    const result = await request(app.getHttpServer())
      .post('/user')
      .send(dto)
      .expect(HttpStatus.CREATED);

    console.log(result.body);
    const userId = await (await userRepository.findOne()).getUser_id;
    expect(JSON.stringify(result.body)).toBe(
      JSON.stringify(await userService.getUserInfo(userId)),
    );
  });
});
