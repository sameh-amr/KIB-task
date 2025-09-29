import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ListGenresHandler } from './queries/genres/list-genres/list-genres.handler';
import { ListMoviesHandler } from './queries/movies/list-movies/list-movies.handler';
import { GetMovieHandler } from './queries/movies/get-movie/get-movie.handler';
import { PersistenceModule } from '../infrastructure/persistence/persistence.module';
import { TmdbModule } from '../infrastructure/clients/tmdb/tmdb.module';


@Module({
  imports: [CqrsModule, PersistenceModule,TmdbModule],
  providers: [ListGenresHandler, ListMoviesHandler, GetMovieHandler],
  exports: [CqrsModule],
})
export class ApplicationModule {}
