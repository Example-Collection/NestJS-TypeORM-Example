import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';

@Controller('movies')
export class MoviesController {
  @Get('/movies')
  getAll(): string {
    return 'This will return all movieS';
  }

  @Get('/:id')
  getMovieById(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: string,
  ): string {
    return `This is info about a movie. (ID : ${id}), ${typeof id}`;
  }

  @Post()
  createMovie(): string {
    return 'This will create a movie.';
  }

  @Delete('/:id')
  deleteMovie(@Param('id', ParseIntPipe) id: number): string {
    return `This will remove a movie.(ID : ${id}`;
  }

  @Put('/:id')
  updateMovie(@Param('id', ParseIntPipe) id: number): string {
    return `This will update a movie.(ID : ${id})`;
  }

  @Patch('/:id')
  updateMovieInfo(@Param('id', ParseIntPipe) id: number): string {
    return `This will update some info about movie.(ID : ${id})`;
  }
}
