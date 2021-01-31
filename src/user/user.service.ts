import { Injectable } from '@nestjs/common';
import { UserCreateDto } from 'src/dtos/create-user.dto';

@Injectable()
export class UserService {
  saveUser(dto: UserCreateDto): UserCreateDto {
    return dto;
  }
}
