import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UserCreateDto } from './dtos/create-user.dto';
import { UserService } from './user.service';
import { UserModule } from './user.module';
import { UserRepository } from '../entities/user.repository';
import { getConnection, getRepository } from 'typeorm';
import { User } from '../entities/user.entity';

describe('UserService Logic Test', () => {
  let userService: UserService;
  // let userRepository: UserRepository;

  const NAME = 'NAME';
  const EMAIL = 'test@test.com';
  const PASSWORD = '1234abc5';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          logging: false,
          synchronize: true,
          entities: ['src/**/*.entity{.ts,.js}'],
          name: 'CON4TEST',
        }),
        TypeOrmModule.forFeature([User], 'CON4TEST'),
      ],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterEach(async () => {
    const connection = getConnection('CON4TEST');
    return await connection.close();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('Should Save User', async () => {
    const dto = new UserCreateDto();
    dto.name = NAME;
    dto.email = EMAIL;
    dto.password = PASSWORD;

    const responseDto = await userService.saveUser(dto);
    expect(responseDto.getName).toBe(NAME);
    expect(responseDto.getEmail).toBe(EMAIL);
    expect(responseDto.getUserId).toBeInstanceOf(Number);
  });
});
