import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ListGenresHandler } from './queries/genres/list-genres/list-genres.handler';
import { ListMoviesHandler } from './queries/movies/list-movies/list-movies.handler';
import { GetMovieHandler } from './queries/movies/get-movie/get-movie.handler';
import { PersistenceModule } from '../infrastructure/persistence/persistence.module';
import { TmdbModule } from '../infrastructure/clients/tmdb/tmdb.module';
import { GetTmdbGenresHandler } from './queries/tmdb/get-tmdb-genres/get-tmdb-genres.handler';
import { GetTmdbPopularMoviesHandler } from './queries/tmdb/get-tmdb-popular-movies/get-tmdb-popular-movies.handler';

@Module({
  imports: [CqrsModule, PersistenceModule, TmdbModule],
  providers: [
    ListGenresHandler,
    ListMoviesHandler,
    GetMovieHandler,
    GetTmdbGenresHandler,
    GetTmdbPopularMoviesHandler,
  ],
  exports: [CqrsModule],
})
export class ApplicationModule {}
