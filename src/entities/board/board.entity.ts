import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'boards' })
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn()
  private board_id: number;

  @Column({ nullable: false, length: 400 })
  private title: string;

  @Column({ nullable: false, length: 1000 })
  private content: string;

  @Column({ nullable: false, type: 'datetime' })
  private created_at: Date;

  @Column({ nullable: false, type: 'datetime' })
  private last_modified_at: Date;

  @Column({ nullable: false })
  private user_id: number;
}
