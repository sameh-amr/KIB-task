import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTmdbPopularMoviesQuery } from './get-tmdb-popular-movies.query';
import { TmdbService } from '../../../../infrastructure/clients/tmdb/tmdb.service';

@QueryHandler(GetTmdbPopularMoviesQuery)
export class GetTmdbPopularMoviesHandler implements IQueryHandler<GetTmdbPopularMoviesQuery> {
  constructor(private readonly tmdb: TmdbService) {}

  async execute({ pages }: GetTmdbPopularMoviesQuery) {
    const max = Math.max(1, Math.min(5, pages ?? 1)); // small safety cap
    const all: any[] = [];
    for (let p = 1; p <= max; p++) {
      const list = await this.tmdb.fetchPopularMovies(p);
      all.push(...list);
    }
    return all;
  }
}
