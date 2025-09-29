import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddFavoriteCommand } from './add-favorite.command';
import { FavoriteRepository } from '../../../../domain/repositories/favorite.repository';
import { MovieRepository } from '../../../../domain/repositories/movie.repository';
import { NotFoundException } from '@nestjs/common';
import { MoviesCacheService } from '../../../../infrastructure/cache/movies-cache.service';
import { RatingRepository } from '../../../../domain/repositories/rating.repository';

@CommandHandler(AddFavoriteCommand)
export class AddFavoriteHandler implements ICommandHandler<AddFavoriteCommand> {
  constructor(
    private readonly favorites: FavoriteRepository,
    private readonly movies: MovieRepository,
    private readonly cache: MoviesCacheService,
    private readonly ratings: RatingRepository,
  ) {}

  async execute({ userId, movieId }: AddFavoriteCommand) {
    const movie = await this.movies.findById(movieId);
    if (!movie) throw new NotFoundException('Movie not found');

    const exists = await this.favorites.isFavorite(userId, movieId);
    if (!exists) {
    await this.favorites.create({ userId, movieId });
    const avg = await this.ratings.getAverageForMovie(movieId);
    await this.cache.updateFavoritesAfterAdd(userId, {
      id: movie.id,
      tmdbId: movie.tmdbId,
      title: movie.title,
      releaseDate: movie.releaseDate ?? null,
      averageRating: avg ?? null,
    });
  }

    return { ok: true };
  }
}
