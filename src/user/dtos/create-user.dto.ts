import { IsEmail, IsString } from 'class-validator';
import { User } from 'src/entities/user.entity';

export class UserCreateDto {
  @IsString()
  private readonly name: string;

  @IsEmail()
  private readonly email: string;

  @IsString()
  private readonly password: string;

  toEntity = (): User => {
    const user = new User();
    user.setName = this.name;
    user.setEmail = this.email;
    user.setPassword = this.password;
    return user;
  };
}
