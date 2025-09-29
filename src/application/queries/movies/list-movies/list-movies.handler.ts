import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListMoviesQuery } from './list-movies.query';
import { MovieRepository } from '../../../../domain/repositories/movie.repository';

@QueryHandler(ListMoviesQuery)
export class ListMoviesHandler implements IQueryHandler<ListMoviesQuery> {
  constructor(private readonly movies: MovieRepository) {}

  async execute(q: ListMoviesQuery) {
    return this.movies.search({
      q: q.q,
      genreId: q.genreId,
      page: q.page,
      limit: q.limit,
    });
  }
}
