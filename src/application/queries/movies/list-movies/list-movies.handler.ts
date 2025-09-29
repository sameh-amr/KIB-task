import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListMoviesQuery } from './list-movies.query';
import { MovieRepository } from '../../../../domain/repositories/movie.repository';
import { MoviesCacheService } from '../../../../infrastructure/cache/movies-cache.service';

@QueryHandler(ListMoviesQuery)
export class ListMoviesHandler implements IQueryHandler<ListMoviesQuery> {
  constructor(
    private readonly movies: MovieRepository,
    private readonly cache: MoviesCacheService,
  ) {}

  async execute(q: ListMoviesQuery) {
    const key = this.cache.buildMoviesKey(q.q, q.genreId, q.page, q.limit);

    const cached = await this.cache.get<any>(key);
    if (cached) return cached;

    const result = await this.movies.search({
      q: q.q,
      genreId: q.genreId,
      page: q.page,
      limit: q.limit,
    });

    await this.cache.set(key, result);
    return result;
  }
}
