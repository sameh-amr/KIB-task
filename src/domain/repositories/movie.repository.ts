import type { Movie } from '../models/movie';
import { BaseRepository } from './base.repository';

export abstract class MovieRepository extends BaseRepository<Movie, number> {
  abstract findByTmdbId(tmdbId: number): Promise<Movie | null>;
}
