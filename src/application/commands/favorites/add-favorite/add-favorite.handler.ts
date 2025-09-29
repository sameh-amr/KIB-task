import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddFavoriteCommand } from './add-favorite.command';
import { FavoriteRepository } from '../../../../domain/repositories/favorite.repository';
import { MovieRepository } from '../../../../domain/repositories/movie.repository';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(AddFavoriteCommand)
export class AddFavoriteHandler implements ICommandHandler<AddFavoriteCommand> {
  constructor(
    private readonly favorites: FavoriteRepository,
    private readonly movies: MovieRepository,
  ) {}

  async execute({ userId, movieId }: AddFavoriteCommand) {
    const movie = await this.movies.findById(movieId);
    if (!movie) throw new NotFoundException('Movie not found');

    const exists = await this.favorites.isFavorite(userId, movieId);
    if (!exists) await this.favorites.create({ userId, movieId });

    return { ok: true };
  }
}
