import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'boards' })
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn()
  private board_id: number;

  @Column({ nullable: false, length: 400 })
  private title: string;

  @Column({ nullable: false, length: 1000 })
  private content: string;

  @CreateDateColumn({ type: 'datetime', nullable: false })
  private created_at: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: false })
  private last_modified_at: Date;

  @Column({ nullable: false })
  private user_id: number;

  get getBoard_id(): number {
    return this.board_id;
  }

  get getTitle(): string {
    return this.title;
  }

  get getContent(): string {
    return this.content;
  }

  get getCreatedAt(): Date {
    return this.created_at;
  }

  get getLastModifiedAt(): Date {
    return this.last_modified_at;
  }

  get getUser_id(): number {
    return this.user_id;
  }

  set setTitle(title: string) {
    this.title = title;
  }

  set setContent(content: string) {
    this.content = content;
  }

  set setUser_id(user_id: number) {
    this.user_id = user_id;
  }
}
