import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MovieEntity } from './entities/movie.entity';
import { GenreEntity } from './entities/genre.entity';
import { RatingEntity } from './entities/rating.entity';
import { FavoriteEntity } from './entities/favorite.entity';


import { TypeormMovieRepository } from './repositories/typeorm-movie.repository';
import { TypeormGenreRepository } from './repositories/typeorm-genre.repository';

import { MovieRepository } from '../../domain/repositories/movie.repository';
import { GenreRepository } from '../../domain/repositories/genre.repository';

import { RatingRepository } from 'src/domain/repositories/rating.repository';
import { TypeormRatingRepository } from './repositories/typeorm-rating.repository';

import { FavoriteRepository } from '../../domain/repositories/favorite.repository';
import { TypeormFavoriteRepository } from './repositories/typeorm-favorite.repository';


@Module({
  imports: [TypeOrmModule.forFeature([MovieEntity, GenreEntity,RatingEntity,FavoriteEntity])],
  providers: [
    { provide: MovieRepository, useClass: TypeormMovieRepository },
    { provide: GenreRepository, useClass: TypeormGenreRepository },
    { provide: RatingRepository, useClass: TypeormRatingRepository },
    { provide: FavoriteRepository, useClass: TypeormFavoriteRepository  },
  ],
  exports: [MovieRepository, GenreRepository, RatingRepository,FavoriteRepository],
})
export class PersistenceModule {}
