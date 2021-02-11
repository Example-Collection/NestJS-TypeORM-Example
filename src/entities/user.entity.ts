import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  private user_id: number;

  @Column({ nullable: false })
  private name: string;

  @Column({ nullable: false, unique: true })
  private email: string;

  @Column({ nullable: false })
  private password: string;

  get getUser_id(): number {
    return this.user_id;
  }

  get getName(): string {
    return this.name;
  }

  get getEmail(): string {
    return this.email;
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
