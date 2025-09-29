import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMovieQuery } from './get-movie.query';
import { MovieRepository } from '../../../../domain/repositories/movie.repository';
import { RatingRepository } from '../../../../domain/repositories/rating.repository';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetMovieQuery)
export class GetMovieHandler implements IQueryHandler<GetMovieQuery> {
  constructor(
    private readonly movies: MovieRepository,
    private readonly ratings: RatingRepository,
  ) {}

  async execute({ id }: GetMovieQuery) {
    const [movie, avg] = await Promise.all([
      this.movies.findById(id),
      this.ratings.getAverageForMovie(id),
    ]);

    if (!movie) throw new NotFoundException('Movie not found');
    return { ...movie, averageRating: avg ?? null };
  }
}
