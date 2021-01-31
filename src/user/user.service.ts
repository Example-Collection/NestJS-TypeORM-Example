import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserCreateDto } from 'src/dtos/create-user.dto';
import { UserUpdateDto } from 'src/dtos/update-user.dto';
import { User } from './user.model';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly UserModel: Model<User>) {}

  async saveUser(dto: UserCreateDto): Promise<UserCreateDto> {
    const newUser = new this.UserModel({
      email: dto.email,
      password: dto.password,
      phoneNumber: dto.phoneNumber,
      name: dto.name,
    });
    await newUser.save();
    return dto;
  }
  updateUser(dto: UserUpdateDto): UserUpdateDto {
    return dto;
  }
}
