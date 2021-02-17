import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

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

  @ManyToOne((type) => User, (user) => user.boards)
  user: User;

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

  set setTitle(title: string) {
    this.title = title;
  }

  set setContent(content: string) {
    this.content = content;
  }
}
