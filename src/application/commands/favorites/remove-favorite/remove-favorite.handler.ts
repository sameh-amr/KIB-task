import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveFavoriteCommand } from './remove-favorite.command';
import { FavoriteRepository } from '../../../../domain/repositories/favorite.repository';

@CommandHandler(RemoveFavoriteCommand)
export class RemoveFavoriteHandler implements ICommandHandler<RemoveFavoriteCommand> {
  constructor(private readonly favorites: FavoriteRepository) {}

  async execute({ userId, movieId }: RemoveFavoriteCommand) {
    await this.favorites.deleteByUserAndMovie(userId, movieId);
    return { ok: true };
  }
}
