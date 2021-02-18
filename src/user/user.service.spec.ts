import { UserCreateDto } from './dtos/create-user.dto';
import { UserService } from './user.service';
import { Connection, Repository } from 'typeorm';
import { User } from '../entities/user/user.entity';
import { createMemoryDB } from '../utils/connections/create-memory-db';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserUpdateDto } from './dtos/update-user.dto';
import { BasicMessageDto } from '../common/dtos/basic-message.dto';
import { UserLoginRequestDto } from './dtos/user-login-request.dto';
import {
  extractUserId,
  generateAccessToken,
} from '../utils/auth/jwt-token-util';
import { Board } from '../entities/board/board.entity';

describe('UserService Logic Test', () => {
  let userService: UserService;
  let connection: Connection;
  let userRepository: Repository<User>;

  const NAME = 'NAME';
  const EMAIL = 'test@test.com';
  const PASSWORD = '1234abc5';
  const WRONG_TOKEN = 'asdfasdf';

  const saveUser = async (): Promise<User> => {
    const savedUser = new User();
    savedUser.setEmail = EMAIL;
    savedUser.setName = NAME;
    savedUser.setPassword = PASSWORD;
    return await userRepository.save(savedUser);
  };

  beforeAll(async () => {
    connection = await createMemoryDB([User, Board]);
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

  it('saveUser(): Should Save User', async () => {
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

  it('saveUser(): Should not save user and throw ConflictException', async () => {
    expect.assertions(1);

    await saveUser();

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

  it('getUserInfo(): Should get user info correctly', async () => {
    const savedUser = await saveUser();

    const response = await userService.getUserInfo(
      savedUser.getUser_id,
      generateAccessToken(savedUser.getUser_id),
    );
    expect(response.user_id).toBe(savedUser.getUser_id);
    expect(response.email).toBe(savedUser.getEmail);
    expect(response.name).toBe(savedUser.getName);
  });

  it('getUserInfo(): Should throw NotFoundException if user_id is invalid', async () => {
    expect.assertions(1);
    try {
      await userService.getUserInfo(-1, generateAccessToken(-1));
    } catch (exception) {
      expect(exception).toBeInstanceOf(NotFoundException);
    }
  });

  it('getUserInfo(): Should throw ForbiddenException if userId in token is not equal to path parameter', async () => {
    expect.assertions(1);
    const savedUser = await saveUser();
    try {
      await userService.getUserInfo(
        savedUser.getUser_id,
        generateAccessToken(-1),
      );
    } catch (exception) {
      expect(exception).toBeInstanceOf(ForbiddenException);
    }
  });

  it('getUserInfo(): Should throw UnauthorizedException if token is wrong', async () => {
    expect.assertions(1);
    const savedUser = await saveUser();
    try {
      await userService.getUserInfo(savedUser.getUser_id, WRONG_TOKEN);
    } catch (exception) {
      expect(exception).toBeInstanceOf(UnauthorizedException);
    }
  });

  it('updateUserInfo(): Should update user infos(Both name and password)', async () => {
    const savedUser = await saveUser();

    const updateDto = new UserUpdateDto();
    updateDto.name = 'NEW_NAME';
    updateDto.password = 'NEW_PASSWORD';

    const response = await userService.updateUserInfo(
      savedUser.getUser_id,
      updateDto,
      generateAccessToken(savedUser.getUser_id),
    );

    expect(response).toBeInstanceOf(BasicMessageDto);

    const updatedUser = await userRepository.findOne(savedUser.getUser_id);
    expect(updatedUser.getName).toBe('NEW_NAME');
    expect(updatedUser.getPassword).toBe('NEW_PASSWORD');
  });

  it('updateUserInfo(): Should update user info(Only name)', async () => {
    const savedUser = await saveUser();

    const updateDto = new UserUpdateDto();
    updateDto.name = 'NEW_NAME';

    const response = await userService.updateUserInfo(
      savedUser.getUser_id,
      updateDto,
      generateAccessToken(savedUser.getUser_id),
    );
    expect(response).toBeInstanceOf(BasicMessageDto);

    const updatedUser = await userRepository.findOne(savedUser.getUser_id);
    expect(updatedUser.getName).toBe('NEW_NAME');
    expect(updatedUser.getPassword).toBe(PASSWORD);
  });

  it('updateUserInfo(): Should update user info(Only password)', async () => {
    const savedUser = await saveUser();

    const updateDto = new UserUpdateDto();
    updateDto.password = 'NEW_PASSWORD';

    const response = await userService.updateUserInfo(
      savedUser.getUser_id,
      updateDto,
      generateAccessToken(savedUser.getUser_id),
    );
    expect(response).toBeInstanceOf(BasicMessageDto);

    const updatedUser = await userRepository.findOne(savedUser.getUser_id);
    expect(updatedUser.getName).toBe(NAME);
    expect(updatedUser.getPassword).toBe('NEW_PASSWORD');
  });

  it('updateUserInfo(): Should throw ForbiddenException if userId in token is not equal to path parameter', async () => {
    expect.assertions(1);
    const savedUser = await saveUser();
    const updateDto = new UserUpdateDto();
    updateDto.password = 'NEW_PASSWORD';
    updateDto.name = 'NEW_NAME';

    try {
      await userService.updateUserInfo(
        savedUser.getUser_id,
        updateDto,
        generateAccessToken(-1),
      );
    } catch (exception) {
      expect(exception).toBeInstanceOf(ForbiddenException);
    }
  });

  it('updateUserInfo(): Should throw UnauthorizedException if token is wrong', async () => {
    expect.assertions(1);
    const savedUser = await saveUser();
    const updateDto = new UserUpdateDto();
    updateDto.password = 'NEW_PASSWORD';
    updateDto.name = 'NEW_NAME';
    try {
      await userService.updateUserInfo(
        savedUser.getUser_id,
        updateDto,
        WRONG_TOKEN,
      );
    } catch (exception) {
      expect(exception).toBeInstanceOf(UnauthorizedException);
    }
  });

  it('updateUserInfo(): Should throw NotFoundException if userId is invalid', async () => {
    expect.assertions(1);
    const updateDto = new UserUpdateDto();
    updateDto.password = 'NEW_PASSWORD';
    updateDto.name = 'NEW_NAME';
    try {
      await userService.updateUserInfo(1, updateDto, generateAccessToken(1));
    } catch (exception) {
      expect(exception).toBeInstanceOf(NotFoundException);
    }
  });

  it('removeUser(): Should remove user', async () => {
    const savedUser = await saveUser();

    const response = await userService.removeUser(
      savedUser.getUser_id,
      generateAccessToken(savedUser.getUser_id),
    );
    expect(response).toBeInstanceOf(BasicMessageDto);

    const user = await userRepository.findOne(savedUser.getUser_id);
    expect(user).toBeUndefined();
  });

  it('removeUser(): Should throw ForbiddenException is userId in token and userId in path parameter is different', async () => {
    expect.assertions(1);
    const savedUser = await saveUser();
    try {
      await userService.removeUser(
        savedUser.getUser_id,
        generateAccessToken(-1),
      );
    } catch (exception) {
      expect(exception).toBeInstanceOf(ForbiddenException);
    }
  });

  it('removeUser(): Should throw UnauthoziredException if token is wrong', async () => {
    expect.assertions(1);
    const savedUser = await saveUser();
    try {
      await userService.removeUser(savedUser.getUser_id, WRONG_TOKEN);
    } catch (exception) {
      expect(exception).toBeInstanceOf(UnauthorizedException);
    }
  });

  it('login(): Should login user', async () => {
    const savedUser = await saveUser();

    const requestDto = new UserLoginRequestDto();
    requestDto.email = EMAIL;
    requestDto.password = PASSWORD;

    const response = await userService.login(requestDto);
    expect(response.email).toBe(EMAIL);
    expect(response.name).toBe(NAME);
    expect(response.user_id).toBe(savedUser.getUser_id);
    extractUserId(response.accessToken);
    expect(extractUserId(response.accessToken)).toBe(savedUser.getUser_id);
  });

  it('login(): Should throw NotFoundException is login data is invalid', async () => {
    await saveUser();
    const requestDto = new UserLoginRequestDto();
    requestDto.email = 'wrong@email.com';
    requestDto.password = PASSWORD;

    expect.assertions(1);
    try {
      await userService.login(requestDto);
    } catch (exception) {
      expect(exception).toBeInstanceOf(NotFoundException);
    }
  });
});
