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

  async saveUser(dto: UserCreateDto): Promise<UserInfoResponseDto> {
    const user = await this.userRepository.save(dto.toEntity());
    return new UserInfoResponseDto(user);
  }
}
