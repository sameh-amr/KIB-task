import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListGenresQuery } from './list-genres.query';
import { GenreRepository } from '../../../../domain/repositories/genre.repository';

@QueryHandler(ListGenresQuery)
export class ListGenresHandler implements IQueryHandler<ListGenresQuery> {
  constructor(private readonly genres: GenreRepository) {}

  async execute(_: ListGenresQuery) {
    return this.genres.findAll();
  }
}
