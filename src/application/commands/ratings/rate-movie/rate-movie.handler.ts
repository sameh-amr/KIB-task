import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RateMovieCommand } from './rate-movie.command';
import { MovieRepository } from '../../../../domain/repositories/movie.repository';
import { RatingRepository } from '../../../../domain/repositories/rating.repository';

@CommandHandler(RateMovieCommand)
export class RateMovieHandler implements ICommandHandler<RateMovieCommand> {
  constructor(
    private readonly movies: MovieRepository,
    private readonly ratings: RatingRepository,
  ) {}

  async execute({ movieId, userId, rating }: RateMovieCommand) {
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw new BadRequestException('rating must be between 1 and 5');
    }

    const movie = await this.movies.findById(movieId);
    if (!movie) throw new NotFoundException('Movie not found');

    await this.ratings.upsert({ movieId, userId, value: rating });

    const averageRating = await this.ratings.getAverageForMovie(movieId);
    return { ok: true, movieId, averageRating };
  }
}
