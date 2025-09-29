import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SyncTmdbCommand } from './sync-tmdb.command';
import { TmdbService } from '../../../../infrastructure/clients/tmdb/tmdb.service';
import { UpsertGenresCommand } from '../../genres/upsert-genres/upsert-genres.command';
import { UpsertMoviesCommand } from '../../movies/upsert-movies/upsert-movies.command';

function toDateOrNull(s?: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

@CommandHandler(SyncTmdbCommand)
export class SyncTmdbHandler implements ICommandHandler<SyncTmdbCommand> {
  constructor(private readonly tmdb: TmdbService, private readonly bus: CommandBus) {}

  async execute({ pages }: SyncTmdbCommand) {
    const genres = await this.tmdb.fetchGenres();
    const gRes = await this.bus.execute(new UpsertGenresCommand(genres.map(g => ({ name: g.name }))));

    const max = Math.max(1, Math.min(5, pages ?? 1)); // simple cap
    const movies: { tmdbId: number; title: string; releaseDate: Date | null }[] = [];
    for (let p = 1; p <= max; p++) {
      const batch = await this.tmdb.fetchPopularMovies(p);
      for (const m of batch) {
        movies.push({ tmdbId: m.id, title: m.title, releaseDate: toDateOrNull(m.release_date) });
      }
    }
    const mRes = await this.bus.execute(new UpsertMoviesCommand(movies));

    return { genres: gRes, movies: mRes };
  }
}
