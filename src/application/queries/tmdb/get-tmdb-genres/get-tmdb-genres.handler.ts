import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTmdbGenresQuery } from './get-tmdb-genres.query';
import { TmdbService } from '../../../../infrastructure/clients/tmdb/tmdb.service';

@QueryHandler(GetTmdbGenresQuery)
export class GetTmdbGenresHandler implements IQueryHandler<GetTmdbGenresQuery> {
  constructor(private readonly tmdb: TmdbService) {}

  async execute() {
    return this.tmdb.fetchGenres(); 
  }
}
