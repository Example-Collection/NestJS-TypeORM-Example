import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCreateDto } from '../user/dtos/create-user.dto';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { UserInfoResponseDto } from './dtos/user-info.dto';
import { UserUpdateDto } from './dtos/update-user.dto';
import { BasicMessageDto } from '../common/dtos/basic-message.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

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
        .select('user.user_id')
        .from(User, 'user')
        .where('user.email = :email', { email })
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

  async getUserInfo(userId: number): Promise<UserInfoResponseDto> {
    const user = await this.userRepository.findOne(userId);
    if (!!user) {
      return new UserInfoResponseDto(user);
    } else throw new NotFoundException();
  }

  async updateUserInfo(
    userId: number,
    dto: UserUpdateDto,
  ): Promise<BasicMessageDto> {
    const result = await this.userRepository.update(userId, { ...dto });
    if (result.affected !== 0) {
      return new BasicMessageDto('Updated Successfully.');
    } else throw new NotFoundException();
  }

  async removeUser(userId: number): Promise<BasicMessageDto> {
    const result = await this.userRepository.delete(userId);
    if (result.affected !== 0) {
      return new BasicMessageDto('Deleted Successfully.');
    } else throw new NotFoundException();
  }
}
