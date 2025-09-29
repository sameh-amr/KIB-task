import type { Rating } from '../models/rating';
import type { NewRating } from '../models/new-rating';
import { BaseRepository } from './base.repository';

export abstract class RatingRepository extends BaseRepository<Rating, number, NewRating> {
  abstract findByUserAndMovie(userId: string, movieId: number): Promise<Rating | null>;
  abstract upsert(data: NewRating): Promise<Rating>;
  abstract getAverageForMovie(movieId: number): Promise<number | null>;
}
