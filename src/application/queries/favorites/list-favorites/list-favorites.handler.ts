import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListFavoritesQuery } from './list-favorites.query';
import { FavoriteRepository } from '../../../../domain/repositories/favorite.repository';

@QueryHandler(ListFavoritesQuery)
export class ListFavoritesHandler implements IQueryHandler<ListFavoritesQuery> {
  constructor(private readonly favorites: FavoriteRepository) {}

  async execute(q: ListFavoritesQuery) {
    return this.favorites.listUserFavorites(q.userId, {
      q: q.q,
      genreId: q.genreId,
      page: q.page,
      limit: q.limit,
    });
  }
}
