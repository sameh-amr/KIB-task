import type { Genre } from '../models/genre';
import { NewGenre } from '../models/new-genre';
import { BaseRepository } from './base.repository';

export abstract class GenreRepository extends BaseRepository<Genre, number,NewGenre> {
  abstract findByTmdbId(tmdbId: number): Promise<Genre | null>;
  abstract findByName(name: string): Promise<Genre | null>;
}
