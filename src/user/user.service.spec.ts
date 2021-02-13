import { UserCreateDto } from './dtos/create-user.dto';
import { UserService } from './user.service';
import { Connection, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { createMemoryDB } from '../utils/create-memory-db';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UserService Logic Test', () => {
  let userService: UserService;
  let connection: Connection;
  let userRepository: Repository<User>;

  const NAME = 'NAME';
  const EMAIL = 'test@test.com';
  const PASSWORD = '1234abc5';

  beforeAll(async () => {
    connection = await createMemoryDB([User]);
    userRepository = await connection.getRepository(User);
    userService = new UserService(userRepository);
  });

  afterAll(async () => {
    await connection.close();
  });

  afterEach(async () => {
    await userRepository.query('DELETE FROM users');
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

    const savedUser = await userRepository.findOne(responseDto.user_id);

    expect(savedUser.getUser_id).toBe(responseDto.user_id);
    expect(savedUser.getName).toBe(responseDto.name);
    expect(savedUser.getEmail).toBe(responseDto.email);
    expect(savedUser.getPassword).toBe(PASSWORD);
  });

  it('Should not save user and throw ConflictException', async () => {
    expect.assertions(1);

    const savedUser = new User();
    savedUser.setName = NAME;
    savedUser.setEmail = EMAIL;
    savedUser.setPassword = PASSWORD;
    await userRepository.save(savedUser);

    const dto = new UserCreateDto();
    dto.name = NAME;
    dto.email = EMAIL;
    dto.password = PASSWORD;

    try {
      await userService.saveUser(dto);
    } catch (exception) {
      expect(exception).toBeInstanceOf(ConflictException);
    }
  });

  it('Should get user info correctly', async () => {
    let savedUser = new User();
    savedUser.setName = NAME;
    savedUser.setEmail = EMAIL;
    savedUser.setPassword = PASSWORD;
    savedUser = await userRepository.save(savedUser);

    const response = await userService.getUserInfo(savedUser.getUser_id);
    expect(response.user_id).toBe(savedUser.getUser_id);
    expect(response.email).toBe(savedUser.getEmail);
    expect(response.name).toBe(savedUser.getName);
  });

  it('Should throw NotFoundException if user_id is invalid', async () => {
    expect.assertions(1);
    try {
      await userService.getUserInfo(-1);
    } catch (exception) {
      expect(exception).toBeInstanceOf(NotFoundException);
    }
  });
});
