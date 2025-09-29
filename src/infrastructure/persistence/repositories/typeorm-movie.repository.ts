import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { Movie } from '../../../domain/models/movie';
import { MovieRepository } from '../../../domain/repositories/movie.repository';

import { MovieEntity } from '../entities/movie.entity';
import { BaseTypeormRepository } from './base.repository';
import { Mapper } from '../mappers/mapper';
import type { NewMovie } from '../../../domain/models/new-movie';

const MovieMapper: Mapper<Movie, MovieEntity, NewMovie> = {
  toDomain: (e) => ({
    id: e.id,
    tmdbId: e.tmdbId,
    title: e.title,
    releaseDate: e.releaseDate,
  }),
  toEntity: (m) => {
    const e = new MovieEntity();
    e.id = m.id;
    e.tmdbId = m.tmdbId;
    e.title = m.title;
    e.releaseDate = m.releaseDate;
    return e;
  },
  fromCreate: (data) => {
    const e = new MovieEntity();
    e.tmdbId = data.tmdbId;
    e.title = data.title;
    e.releaseDate = data.releaseDate;
    return e;
  },
};

@Injectable()
export class TypeormMovieRepository
  extends BaseTypeormRepository<Movie, MovieEntity, number, NewMovie>
  implements MovieRepository
{
  constructor(
    @InjectRepository(MovieEntity) repo: Repository<MovieEntity>,
  ) {
    super(repo, MovieMapper);
  }

  async findByTmdbId(tmdbId: number): Promise<Movie | null> {
    const entity = await this.repo.findOne({ where: { tmdbId } });
    return entity ? this.mapper.toDomain(entity) : null;
  }
}
