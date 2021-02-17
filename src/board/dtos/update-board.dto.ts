import { PartialType } from '@nestjs/mapped-types';
import { BoardCreateDto } from './create-board-dto';

export class BoardUpdateDto extends PartialType(BoardCreateDto) {}
