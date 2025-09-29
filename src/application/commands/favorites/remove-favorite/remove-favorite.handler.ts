import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveFavoriteCommand } from './remove-favorite.command';
import { FavoriteRepository } from '../../../../domain/repositories/favorite.repository';
import { MoviesCacheService } from '../../../../infrastructure/cache/movies-cache.service';

@CommandHandler(RemoveFavoriteCommand)
export class RemoveFavoriteHandler
  implements ICommandHandler<RemoveFavoriteCommand>
{
  constructor(
    private readonly favorites: FavoriteRepository,
    private readonly cache: MoviesCacheService,
  ) {}

  async execute({ userId, movieId }: RemoveFavoriteCommand) {
    await this.favorites.deleteByUserAndMovie(userId, movieId);
    await this.cache.updateFavoritesAfterRemove(userId, movieId);
    return { ok: true };
  }
}
