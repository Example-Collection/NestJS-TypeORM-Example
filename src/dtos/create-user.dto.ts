import { IsEmail, IsString } from 'class-validator';

export class UserCreateDto {
  @IsString()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  readonly password: string;

  @IsString()
  readonly phoneNumber: string;
}
