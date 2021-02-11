import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCreateDto } from 'src/user/dtos/user/create-user.dto';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { UserInfoResponseDto } from './dtos/user/user-info.dto';
import { UserUpdateDto } from './dtos/user/update-user.dto';
import { BasicMessageDto } from './dtos/common/basic-message.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  private userCreateDtoToEntity = (dto: UserCreateDto): User => {
    const user = new User();
    user.setEmail = dto.getEmail;
    user.setName = dto.getName;
    user.setPassword = dto.getPassword;
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
    if (await this.isEmailUsed(dto.getEmail)) {
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
    const user = await this.userRepository.findOne(userId);
    if (!!user) {
      await this.userRepository.save({ ...user, ...dto });
      return new BasicMessageDto('Updated Successfully.');
    } else throw new NotFoundException();
  }
}
