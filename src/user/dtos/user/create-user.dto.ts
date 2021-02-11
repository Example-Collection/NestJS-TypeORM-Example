import { IsEmail, IsString } from 'class-validator';

export class UserCreateDto {
  @IsString()
  private readonly name: string;

  @IsEmail()
  private readonly email: string;

  @IsString()
  private readonly password: string;

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
