import { IsString } from 'class-validator';

export class BoardCreateDto {
  @IsString()
  title: string;

  @IsString()
  content: string;
}
