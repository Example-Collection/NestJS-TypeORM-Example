import { Board } from 'src/entities/board/board.entity';
import { User } from 'src/entities/user/user.entity';

export class BoardInfoResponseDto {
  constructor(user: User, board: Board) {
    this.boardId = board.getBoard_id;
    this.title = board.getTitle;
    this.content = board.getContent;
    this.createdAt = board.getCreatedAt;
    this.lastModifiedAt = board.getLastModifiedAt;
    this.userId = user.getUser_id;
    this.name = user.getName;
  }
  boardId: number;
  title: string;
  content: string;
  createdAt: Date;
  lastModifiedAt: Date;
  userId: number;
  name: string;
}
