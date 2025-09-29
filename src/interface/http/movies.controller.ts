import { Controller, Get, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ListMoviesQuery } from '../../application/queries/movies/list-movies/list-movies.query';
import { GetMovieQuery } from '../../application/queries/movies/get-movie/get-movie.query';

@Controller('movies')
export class MoviesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async list() {
    return this.queryBus.execute(new ListMoviesQuery());
  }

  @Get(':id')
  async byId(@Param('id', ParseIntPipe) id: number) {
    const movie = await this.queryBus.execute(new GetMovieQuery(id));
    if (!movie) throw new NotFoundException('Movie not found');
    return movie;
  }
}
