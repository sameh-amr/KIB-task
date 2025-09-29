import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpsertMoviesCommand } from './upsert-movies.command';
import { MovieRepository } from '../../../../domain/repositories/movie.repository';

@CommandHandler(UpsertMoviesCommand)
export class UpsertMoviesHandler implements ICommandHandler<UpsertMoviesCommand> {
  constructor(private readonly movies: MovieRepository) {}
  async execute({ items }: UpsertMoviesCommand): Promise<{ inserted: number; total: number }> {
    let inserted = 0;
    for (const m of items) {
      const exists = await this.movies.findByTmdbId(m.tmdbId);
      if (!exists) {
        await this.movies.create(m);
        inserted++;
      }
    }
    return { inserted, total: items.length };
  }
}
