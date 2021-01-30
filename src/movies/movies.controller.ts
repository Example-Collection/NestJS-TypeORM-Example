import { Controller, Get } from '@nestjs/common';

@Controller('movies')
export class MoviesController {
  @Get('/movies')
  getAll(): string {
    return 'This will return all movieS';
  }
}
