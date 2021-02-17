import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Board } from '../board/board.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  private user_id: number;

  @Column({ nullable: false })
  private name: string;

  @Column({ nullable: false, unique: true })
  private email: string;

  @Column({ nullable: false })
  private password: string;

  @OneToMany((type) => Board, (board) => board.user)
  boards: Board[];

  get getUser_id(): number {
    return this.user_id;
  }

  get getName(): string {
    return this.name;
  }

  get getEmail(): string {
    return this.email;
  }

  get getPassword(): string {
    return this.password;
  }

  set setEmail(email: string) {
    this.email = email;
  }

  set setName(name: string) {
    this.name = name;
  }

  set setPassword(password: string) {
    this.password = password;
  }
}
