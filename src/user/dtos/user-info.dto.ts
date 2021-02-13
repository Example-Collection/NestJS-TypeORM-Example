import { User } from 'src/entities/user.entity';

export class UserInfoResponseDto {
  constructor(user: User) {
    this.user_id = user.getUser_id;
    this.name = user.getName;
    this.email = user.getEmail;
  }
  user_id: number;
  name: string;
  email: string;
}
