import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RateMovieCommand } from './rate-movie.command';
import { MovieRepository } from '../../../../domain/repositories/movie.repository';
import { RatingRepository } from '../../../../domain/repositories/rating.repository';
import { MoviesCacheService } from 'src/infrastructure/cache/movies-cache.service';

@CommandHandler(RateMovieCommand)
export class RateMovieHandler implements ICommandHandler<RateMovieCommand> {
  constructor(
    private readonly movies: MovieRepository,
    private readonly ratings: RatingRepository,
    private readonly cache: MoviesCacheService,

  ) {}

  async execute({ movieId, userId, rating }: RateMovieCommand) {
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw new BadRequestException('rating must be between 1 and 5');
    }

    const movie = await this.movies.findById(movieId);
    if (!movie) throw new NotFoundException('Movie not found');

    await this.ratings.upsert({ movieId, userId, value: rating });
    
    const averageRating = await this.ratings.getAverageForMovie(movieId);
    await this.cache.patchAverageForMovie(movieId, averageRating);
    return { ok: true, movieId, averageRating };
  }
}
