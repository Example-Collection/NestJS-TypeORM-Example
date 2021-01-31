import { Injectable } from '@nestjs/common';
import { UserCreateDto } from 'src/dtos/create-user.dto';
import { UserUpdateDto } from 'src/dtos/update-user.dto';

@Injectable()
export class UserService {
  saveUser(dto: UserCreateDto): UserCreateDto {
    return dto;
  }
  updateUser(dto: UserUpdateDto): UserUpdateDto {
    return dto;
  }
}
