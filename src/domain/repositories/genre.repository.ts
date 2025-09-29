import type { Genre } from '../models/genre';
import { BaseRepository } from './base.repository';

export abstract class GenreRepository extends BaseRepository<Genre, number> {
  abstract findByName(name: string): Promise<Genre | null>;
}
