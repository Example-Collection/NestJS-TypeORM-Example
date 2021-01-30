import { IsString } from 'class-validator';

export class UserCreateDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  phoneNumber: string;
}
