import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SyncTmdbCommand } from './sync-tmdb.command';
import { TmdbService } from '../../../../infrastructure/clients/tmdb/tmdb.service';
import { UpsertGenresCommand } from '../../genres/upsert-genres/upsert-genres.command';
import { UpsertMoviesCommand } from '../../movies/upsert-movies/upsert-movies.command';
import { GenreRepository } from 'src/domain/repositories/genre.repository';
import { MovieRepository } from 'src/domain/repositories/movie.repository';

function toDateOrNull(s?: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

@CommandHandler(SyncTmdbCommand)
export class SyncTmdbHandler implements ICommandHandler<SyncTmdbCommand> {
  constructor(
    private readonly tmdb: TmdbService,
    private readonly bus: CommandBus,
    private readonly genresRepo: GenreRepository,
    private readonly moviesRepo: MovieRepository,
  ) {}

  async execute({ pages }: SyncTmdbCommand) {
    try {
      const genres = await this.tmdb.fetchGenres();
      const gRes = await this.bus.execute(
        new UpsertGenresCommand(
          genres.map((g) => ({ tmdbId: g.id, name: g.name })),
        ),
      );

      const max = Math.max(1, Math.min(5, pages ?? 1));
      const fetched: Array<{
        tmdbId: number;
        title: string;
        releaseDate: Date | null;
        genreIds: number[];
      }> = [];
      for (let p = 1; p <= max; p++) {
        const batch = await this.tmdb.fetchPopularMovies(p);
        for (const m of batch) {
          fetched.push({
            tmdbId: m.id,
            title: m.title,
            releaseDate: toDateOrNull(m.release_date),
            genreIds: m.genre_ids ?? [],
          });
        }
      }
      await this.bus.execute(
        new UpsertMoviesCommand(
          fetched.map((m) => ({
            tmdbId: m.tmdbId,
            title: m.title,
            releaseDate: m.releaseDate,
          })),
        ),
      );

      const allGenres = await this.genresRepo.findAll();
      const tmdbToLocal = new Map<number, number>();
      for (const g of allGenres)
        if (g.tmdbId != null) tmdbToLocal.set(g.tmdbId, g.id);

      for (const m of fetched) {
        const local = await this.moviesRepo.findByTmdbId(m.tmdbId);
        if (!local) continue; // defensive
        const localGenreIds = m.genreIds
          .map((tid) => tmdbToLocal.get(tid))
          .filter((id): id is number => !!id);
        await this.moviesRepo.setGenres(local.id, localGenreIds);
      }

      return {
        genres: { total: genres.length },
        movies: { scanned: fetched.length },
      };
    } catch (err) {
      console.log(err);
    }
  }
}
