import { Injectable } from '@nestjs/common';
import { UserCreateDto } from 'src/dtos/create-user.dto';

@Injectable()
export class UserService {
  saveUser(dto: UserCreateDto): string {
    return `Saving user.. name:${dto.name}, email:${dto.name}\n
                phoneNumber:${dto.phoneNumber} password:${dto.password}`;
  }
}
