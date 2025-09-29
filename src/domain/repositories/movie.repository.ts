import type { Movie } from '../models/movie';
import { NewMovie } from '../models/new-movie';
import { BaseRepository } from './base.repository';

export abstract class MovieRepository extends BaseRepository<Movie, number,NewMovie> {
  abstract findByTmdbId(tmdbId: number): Promise<Movie | null>;
   abstract setGenres(movieId: number, genreIds: number[]): Promise<void>;
}
