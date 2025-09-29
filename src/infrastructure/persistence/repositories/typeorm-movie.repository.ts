import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import type { Movie } from '../../../domain/models/movie';
import { MovieRepository } from '../../../domain/repositories/movie.repository';

import { MovieEntity } from '../entities/movie.entity';
import { BaseTypeormRepository } from './base.repository';
import { Mapper } from '../mappers/mapper';
import type { NewMovie } from '../../../domain/models/new-movie';
import { GenreEntity } from '../entities/genre.entity';

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
    @InjectRepository(GenreEntity)
    private readonly genreRepo: Repository<GenreEntity>,
  ) {
    super(repo, MovieMapper);
  }
  async setGenres(movieId: number, genreIds: number[]): Promise<void> {
    const wanted = Array.from(new Set(genreIds));
    const movie = await this.repo.findOne({
      where: { id: movieId },
      relations: { genres: true },
    });
    if (!movie) return;
    if (wanted.length === 0) {
      if (movie.genres?.length) {
        await this.repo
          .createQueryBuilder()
          .relation(MovieEntity, 'genres')
          .of(movieId)
          .remove(movie.genres.map((g) => g.id));
      }
      return;
    }

    const targetGenres = await this.genreRepo.find({
      where: { id: In(wanted) },
    });
    const currentIds = new Set(movie.genres?.map((g) => g.id) ?? []);
    const targetIds = new Set(targetGenres.map((g) => g.id));
    const toAdd = [...targetIds].filter((id) => !currentIds.has(id));
    const toRemove = [...currentIds].filter((id) => !targetIds.has(id));

    if (toAdd.length) {
      await this.repo
        .createQueryBuilder()
        .relation(MovieEntity, 'genres')
        .of(movieId)
        .add(toAdd);
    }

    if (toRemove.length) {
      await this.repo
        .createQueryBuilder()
        .relation(MovieEntity, 'genres')
        .of(movieId)
        .remove(toRemove);
    }
  }

  async findByTmdbId(tmdbId: number): Promise<Movie | null> {
    const entity = await this.repo.findOne({ where: { tmdbId } });
    return entity ? this.mapper.toDomain(entity) : null;
  }
}
