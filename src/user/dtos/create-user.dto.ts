import { IsEmail, IsString } from 'class-validator';

export class UserCreateDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  get getName(): string {
    return this.name;
  }

  get getEmail(): string {
    return this.email;
  }

  get getPassword(): string {
    return this.password;
  }
}
