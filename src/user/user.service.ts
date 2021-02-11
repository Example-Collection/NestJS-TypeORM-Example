import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCreateDto } from 'src/user/dtos/create-user.dto';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { UserInfoResponseDto } from './dtos/user-info.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  userCreateDtoToEntity = (dto: UserCreateDto): User => {
    const user = new User();
    user.setEmail = dto.getEmail;
    user.setName = dto.getName;
    user.setPassword = dto.getPassword;
    return user;
  };

  async saveUser(dto: UserCreateDto): Promise<UserInfoResponseDto> {
    const user = await this.userRepository.save(
      this.userCreateDtoToEntity(dto),
    );
    return new UserInfoResponseDto(user);
  }
}
