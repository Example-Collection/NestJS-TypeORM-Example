import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserCreateDto } from '../user/dtos/create-user.dto';
import { User } from '../entities/user.entity';
import { UserInfoResponseDto } from './dtos/user-info.dto';
import { UserUpdateDto } from './dtos/update-user.dto';
import { BasicMessageDto } from '../common/dtos/basic-message.dto';
import { UserRepository } from '../entities/user.repository';
import { UserLoginRequestDto } from './dtos/user-login-request.dto';
import { UserLoginResponseDto } from './dtos/user-login-response.dto';
import {
  extractUserId,
  generateAccessToken,
} from '../utils/auth/jwt-token-util';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  private userCreateDtoToEntity = (dto: UserCreateDto): User => {
    const user = new User();
    user.setEmail = dto.email;
    user.setName = dto.name;
    user.setPassword = dto.password;
    return user;
  };

  private isEmailUsed = async (email: string): Promise<boolean> => {
    return (
      (await this.userRepository
        .createQueryBuilder()
        .select('u.user_id')
        .from(User, 'u')
        .where('u.email = :email', { email })
        .getOne()) !== undefined
    );
  };

  async saveUser(dto: UserCreateDto): Promise<UserInfoResponseDto> {
    if (await this.isEmailUsed(dto.email)) {
      throw new ConflictException('Email is already in use!');
    } else {
      const user = await this.userRepository.save(
        this.userCreateDtoToEntity(dto),
      );
      return new UserInfoResponseDto(user);
    }
  }

  async getUserInfo(
    userId: number,
    token: string,
  ): Promise<UserInfoResponseDto> {
    if (extractUserId(token) !== userId) {
      throw new ForbiddenException('Not authorized to get this user info.');
    }
    const user = await this.userRepository.findOne(userId);
    if (!!user) {
      return new UserInfoResponseDto(user);
    } else throw new NotFoundException();
  }
  å;
  async updateUserInfo(
    userId: number,
    dto: UserUpdateDto,
    token: string,
  ): Promise<BasicMessageDto> {
    if (extractUserId(token) !== userId) {
      throw new ForbiddenException('Not authorized to udpate this user info.');
    }
    const result = await this.userRepository
      .createQueryBuilder()
      .select()
      .update('users', { ...dto })
      .where('user_id = :userId', { userId })
      .execute();
    if (result.affected !== 0) {
      return new BasicMessageDto('Updated Successfully.');
    } else throw new NotFoundException();
  }

  async removeUser(userId: number, token: string): Promise<BasicMessageDto> {
    if (extractUserId(token) !== userId) {
      throw new ForbiddenException('Not authorized to delete this user.');
    }
    const result = await this.userRepository.delete(userId);
    if (result.affected !== 0) {
      return new BasicMessageDto('Deleted Successfully.');
    } else throw new NotFoundException();
  }

  async login(dto: UserLoginRequestDto): Promise<UserLoginResponseDto> {
    const email = dto.email;
    const password = dto.password;
    const user = await this.userRepository.findOne({
      where: {
        email: email,
        password: password,
      },
    });
    if (!!user) {
      const dto = new UserLoginResponseDto(user);
      dto.accessToken = generateAccessToken(user.getUser_id);
      return dto;
    } else throw new NotFoundException();
  }
}
