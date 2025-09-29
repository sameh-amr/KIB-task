import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListMoviesQuery } from './list-movies.query';
import { MovieRepository } from '../../../../domain/repositories/movie.repository';

@QueryHandler(ListMoviesQuery)
export class ListMoviesHandler implements IQueryHandler<ListMoviesQuery> {
  constructor(private readonly movies: MovieRepository) {}

  async execute(_: ListMoviesQuery) {
    return this.movies.findAll();
  }
}
