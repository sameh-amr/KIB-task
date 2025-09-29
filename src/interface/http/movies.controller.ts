import { Controller, Get, Param, ParseIntPipe, NotFoundException, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ListMoviesQuery } from '../../application/queries/movies/list-movies/list-movies.query';
import { GetMovieQuery } from '../../application/queries/movies/get-movie/get-movie.query';

@Controller('movies')
export class MoviesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async list(
    @Query('q') q?: string,
    @Query('genreId') genreIdRaw?: string,
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    const genreId = genreIdRaw ? Number(genreIdRaw) : undefined;
    const page = pageRaw ? Number(pageRaw) : undefined;
    const limit = limitRaw ? Number(limitRaw) : undefined;
    return this.queryBus.execute(new ListMoviesQuery(q, genreId, page, limit));
  }

  @Get(':id')
  async byId(@Param('id', ParseIntPipe) id: number) {
    const movie = await this.queryBus.execute(new GetMovieQuery(id));
    if (!movie) throw new NotFoundException('Movie not found');
    return movie;
  }
}
