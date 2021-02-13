import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UserCreateDto } from './dtos/create-user.dto';
import { UserService } from './user.service';
import { UserModule } from './user.module';
import { UserRepository } from '../entities/user.repository';
import { Connection, getConnection, getRepository, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { createMemoryDB } from '../utils/create-memory-db';

describe('UserService Logic Test', () => {
  let userService: UserService;
  let connection: Connection;
  let userRepository: Repository<User>;

  const NAME = 'NAME';
  const EMAIL = 'test@test.com';
  const PASSWORD = '1234abc5';

  beforeEach(async () => {
    connection = await createMemoryDB([User]);
    userRepository = await connection.getRepository(User);
    userService = new UserService(userRepository);
    // const module: TestingModule = await Test.createTestingModule({
    //   imports: [
    //     TypeOrmModule.forRoot({
    //       type: 'sqlite',
    //       database: ':memory:',
    //       logging: false,
    //       synchronize: true,
    //       entities: ['src/**/*.entity{.ts,.js}'],
    //       name: 'CON4TEST',
    //     }),
    //     TypeOrmModule.forFeature([User], 'CON4TEST'),
    //   ],
    //   providers: [
    //     UserService,
    //     {
    //       provide: getRepositoryToken(User),
    //       useValue: {},
    //     },
    //   ],
  });

  afterEach(async () => {
    await connection.close();
  });

  //userService = module.get<UserService>(UserService);
  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('Should Save User', async () => {
    const dto = new UserCreateDto();
    dto.name = NAME;
    dto.email = EMAIL;
    dto.password = PASSWORD;

    const responseDto = await userService.saveUser(dto);
    console.log(responseDto);
    expect(responseDto.name).toBe(NAME);
    expect(responseDto.email).toBe(EMAIL);
    expect(typeof responseDto.user_id).toBe('number');
  });
});
