import { User } from 'src/entities/user.entity';

export class UserInfoResponseDto {
  constructor(user: User) {
    this.user_id = user.getUser_id;
    this.name = user.getName;
    this.email = user.getEmail;
  }
  private user_id: number;
  private name: string;
  private email: string;

  get getUserId(): number {
    return this.user_id;
  }

  get getName(): string {
    return this.name;
  }

  get getEmail(): string {
    return this.email;
  }
}
