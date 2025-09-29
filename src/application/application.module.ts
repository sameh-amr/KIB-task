import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ListGenresHandler } from './queries/genres/list-genres/list-genres.handler';
import { ListMoviesHandler } from './queries/movies/list-movies/list-movies.handler';
import { GetMovieHandler } from './queries/movies/get-movie/get-movie.handler';
import { PersistenceModule } from '../infrastructure/persistence/persistence.module';
import { TmdbModule } from '../infrastructure/clients/tmdb/tmdb.module';
import { GetTmdbGenresHandler } from './queries/tmdb/get-tmdb-genres/get-tmdb-genres.handler';
import { GetTmdbPopularMoviesHandler } from './queries/tmdb/get-tmdb-popular-movies/get-tmdb-popular-movies.handler';
import { UpsertGenresHandler } from './commands/genres/upsert-genres/upsert-genres.handler';
import { UpsertMoviesHandler } from './commands/movies/upsert-movies/upsert-movies.handler';
import { SyncTmdbHandler } from './commands/sync/sync-tmdb/sync-tmdb.handler';
import { RateMovieHandler } from './commands/ratings/rate-movie/rate-movie.handler';
import { AddFavoriteHandler } from './commands/favorites/add-favorite/add-favorite.handler';
import { RemoveFavoriteHandler } from './commands/favorites/remove-favorite/remove-favorite.handler';
import { ListFavoritesHandler } from './queries/favorites/list-favorites/list-favorites.handler';

@Module({
  imports: [CqrsModule, PersistenceModule, TmdbModule],
  providers: [
    ListGenresHandler,
    ListMoviesHandler,
    GetMovieHandler,
    GetTmdbGenresHandler,
    GetTmdbPopularMoviesHandler,
    UpsertGenresHandler,
    UpsertMoviesHandler,
    SyncTmdbHandler,
    RateMovieHandler,
    AddFavoriteHandler,
    RemoveFavoriteHandler,
    ListFavoritesHandler
  ],
  exports: [CqrsModule],
})
export class ApplicationModule {}
