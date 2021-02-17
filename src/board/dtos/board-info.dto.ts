import { Board } from 'src/entities/board/board.entity';
import { User } from 'src/entities/user/user.entity';

export class BoardInfoResponseDto {
  constructor(user: User, board: Board) {
    this.title = board.getTitle;
    this.content = board.getContent;
    this.createdAt = board.getCreatedAt;
    this.lastModifiedAt = board.getLastModifiedAt;
    this.name = user.getName;
  }
  title: string;
  content: string;
  createdAt: Date;
  lastModifiedAt: Date;
  name: string;
}
