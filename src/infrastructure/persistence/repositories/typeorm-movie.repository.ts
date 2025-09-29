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
import {
  ListMoviesParams,
  Paginated,
  MovieListItem,
} from 'src/domain/models/lists/movie-listing';

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
  async search(params: ListMoviesParams): Promise<Paginated<MovieListItem>> {
    const page = Math.max(1, Number(params.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(params.limit ?? 10)));
    const offset = (page - 1) * limit;

    // Build query
    const qb = this.repo.createQueryBuilder('m')
      // join ratings table to compute AVG; use table name to avoid needing a relation
      .leftJoin('ratings', 'r', 'r.movie_id = m.id')
      .leftJoin('movie_genres', 'mg', 'mg.movie_id = m.id') // for filtering by genre
      .select([
        'm.id AS id',
        'm.tmdbId AS "tmdbId"',
        'm.title AS title',
        'm.releaseDate AS "releaseDate"',
      ])
      .addSelect('AVG(r.value)', 'averageRating');

    if (params.q) qb.andWhere('m.title ILIKE :q', { q: `%${params.q}%` });
    if (params.genreId) qb.andWhere('mg.genre_id = :genreId', { genreId: params.genreId });

    qb.groupBy('m.id')
      .orderBy('m.title', 'ASC')
      .skip(offset)
      .take(limit);

    const rows = await qb.getRawMany<{
      id: string | number;
      tmdbId: string | number;
      title: string;
      releaseDate: Date | null;
      averageRating: string | null;
    }>();

    // Count with same filters (distinct movies)
    const countQb = this.repo.createQueryBuilder('m')
      .leftJoin('movie_genres', 'mg', 'mg.movie_id = m.id')
      .select('m.id')
      .distinct(true);
    if (params.q) countQb.andWhere('m.title ILIKE :q', { q: `%${params.q}%` });
    if (params.genreId) countQb.andWhere('mg.genre_id = :genreId', { genreId: params.genreId });
    const total = await countQb.getCount();

    const data: MovieListItem[] = rows.map((r) => ({
      id: Number(r.id),
      tmdbId: Number(r.tmdbId),
      title: r.title,
      releaseDate: r.releaseDate ? new Date(r.releaseDate) : null,
      averageRating: r.averageRating != null ? Number(r.averageRating) : null,
    }));

    return { data, page, limit, total };
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
