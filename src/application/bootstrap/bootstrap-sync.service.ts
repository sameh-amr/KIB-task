import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SyncTmdbCommand } from '../commands/sync/sync-tmdb/sync-tmdb.command';
import { GenreRepository } from '../../domain/repositories/genre.repository';
import { MovieRepository } from '../../domain/repositories/movie.repository';

@Injectable()
export class BootstrapSyncService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapSyncService.name);

  constructor(
    private readonly bus: CommandBus,
    private readonly genres: GenreRepository,
    private readonly movies: MovieRepository,
  ) {}

  async onApplicationBootstrap() {
    const auto = (process.env.AUTO_SYNC_ON_BOOT ?? '1').toLowerCase();
    if (!(auto === '1' || auto === 'true')) {
      this.logger.log('AUTO_SYNC_ON_BOOT disabled; skipping TMDB sync');
      return;
    }

    const [g, m] = await Promise.all([this.genres.findAll(), this.movies.findAll()]);
    if (g.length > 0 && m.length > 0) {
      this.logger.log('Database already populated; skipping TMDB sync');
      return;
    }

    const pages = Number(process.env.SYNC_MOVIE_PAGES ?? 1);
    this.logger.log(`Running TMDB sync (pages=${pages})...`);
    const result = await this.bus.execute(new SyncTmdbCommand(pages));
    this.logger.log(`TMDB sync done: ${JSON.stringify(result)}`);
  }
}
