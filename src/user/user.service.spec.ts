import { UserCreateDto } from './dtos/create-user.dto';
import { UserService } from './user.service';
import { Connection, Repository } from 'typeorm';
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
  });

  afterEach(async () => {
    await connection.close();
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
    expect(responseDto.name).toBe(NAME);
    expect(responseDto.email).toBe(EMAIL);
    expect(typeof responseDto.user_id).toBe('number');
  });
});
