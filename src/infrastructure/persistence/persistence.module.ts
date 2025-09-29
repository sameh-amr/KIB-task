import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MovieEntity } from './entities/movie.entity';
import { GenreEntity } from './entities/genre.entity';

import { TypeormMovieRepository } from './repositories/typeorm-movie.repository';
import { TypeormGenreRepository } from './repositories/typeorm-genre.repository';

import { MovieRepository } from '../../domain/repositories/movie.repository';
import { GenreRepository } from '../../domain/repositories/genre.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MovieEntity, GenreEntity])],
  providers: [
    { provide: MovieRepository, useClass: TypeormMovieRepository },
    { provide: GenreRepository, useClass: TypeormGenreRepository },
  ],
  exports: [MovieRepository, GenreRepository],
})
export class PersistenceModule {}
