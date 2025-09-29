import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMovieQuery } from './get-movie.query';
import { MovieRepository } from '../../../../domain/repositories/movie.repository';

@QueryHandler(GetMovieQuery)
export class GetMovieHandler implements IQueryHandler<GetMovieQuery> {
  constructor(private readonly movies: MovieRepository) {}

  async execute(query: GetMovieQuery) {
    return this.movies.findById(query.id); // controller can decide 404 on null
  }
}
