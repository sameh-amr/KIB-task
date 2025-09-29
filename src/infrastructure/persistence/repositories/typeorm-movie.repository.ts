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
  const page  = Math.max(1, Number(params.page ?? 1));
  const limit = Math.min(50, Math.max(1, Number(params.limit ?? 10)));
  const offset = (page - 1) * limit;

  // Base: movies only, with optional filters
  const base = this.repo.createQueryBuilder('m');

  if (params.q) {
    base.andWhere('m.title ILIKE :q', { q: `%${params.q}%` });
  }
  if (params.genreId) {
    // Avoid join duplicates: filter with EXISTS instead of join
    base.andWhere(`
      EXISTS (
        SELECT 1 FROM movie_genres mg
        WHERE mg.movie_id = m.id AND mg.genre_id = :genreId
      )
    `, { genreId: params.genreId });
  }

  // Total (same filters)
  const total = await base.clone().getCount();

  // Page (same filters) — clean ORDER BY so skip/take works
  const pageRows = await base.clone()
    .select([
      'm.id   AS id',
      'm.tmdbId AS "tmdbId"',
      'm.title AS title',
      'm.releaseDate AS "releaseDate"',
    ])
    .orderBy('m.title', 'ASC')
    .addOrderBy('m.id', 'ASC')   // deterministic tiebreaker
    .skip(offset)
    .take(limit)
    .getRawMany<{
      id: string|number; tmdbId: string|number; title: string; releaseDate: Date|null;
    }>();

  const ids = pageRows.map(r => Number(r.id));
  if (ids.length === 0) return { data: [], page, limit, total };

  // Averages for just the page IDs (single GROUP BY)
  const avgRows = await this.repo.manager
    .createQueryBuilder()
    .select('r.movie_id', 'movieId')
    .addSelect('AVG(r.value)', 'avg')
    .from('ratings', 'r')
    .where('r.movie_id IN (:...ids)', { ids })
    .groupBy('r.movie_id')
    .getRawMany<{ movieId: string|number; avg: string }>();

  const avgMap = new Map<number, number>();
  for (const r of avgRows) avgMap.set(Number(r.movieId), Number(r.avg));

  // Merge & return
  const data: MovieListItem[] = pageRows.map(r => ({
    id: Number(r.id),
    tmdbId: Number(r.tmdbId),
    title: r.title,
    releaseDate: r.releaseDate ? new Date(r.releaseDate) : null,
    averageRating: avgMap.get(Number(r.id)) ?? null,
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
