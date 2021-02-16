import { User } from 'src/entities/user.entity';

export class UserLoginResponseDto {
  constructor(user: User) {
    this.user_id = user.getUser_id;
    this.name = user.getName;
    this.email = user.getEmail;
    this.schema = 'Bearer';
  }
  user_id: number;
  name: string;
  email: string;
  schema: string;
  accessToken: string;
}
