import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import type { Favorite } from '../../../domain/models/favorite';
import type { NewFavorite } from '../../../domain/models/new-favorite';
import type { ListMoviesParams, Paginated, MovieListItem } from '../../../domain/models/lists/movie-listing';
import { FavoriteRepository } from '../../../domain/repositories/favorite.repository';

import { FavoriteEntity } from '../entities/favorite.entity';
import { MovieEntity } from '../entities/movie.entity';
import { BaseTypeormRepository } from './base.repository';
import { Mapper } from '../mappers/mapper';

const FavoriteMapper: Mapper<Favorite, FavoriteEntity, NewFavorite> = {
  toDomain: (e) => ({
    id: e.id,
    userId: e.userId,
    movieId: e.movie.id,
    createdAt: e.createdAt,
  }),
  toEntity: (f) => {
    const e = new FavoriteEntity();
    if ((f as any).id !== undefined) e.id = (f as any).id;
    e.userId = f.userId;
    e.movie = { id: f.movieId } as MovieEntity;
    return e;
  },
  fromCreate: (data) => {
    const e = new FavoriteEntity();
    e.userId = data.userId;
    e.movie = { id: data.movieId } as MovieEntity;
    return e;
  },
};

@Injectable()
export class TypeormFavoriteRepository
  extends BaseTypeormRepository<Favorite, FavoriteEntity, number, NewFavorite>
  implements FavoriteRepository
{
  constructor(
    @InjectRepository(FavoriteEntity) repo: Repository<FavoriteEntity>,
    @InjectRepository(MovieEntity) private readonly movieRepo: Repository<MovieEntity>,
  ) {
    super(repo, FavoriteMapper);
  }

  async isFavorite(userId: string, movieId: number): Promise<boolean> {
    const row = await this.repo.findOne({ where: { userId, movie: { id: movieId } } });
    return !!row;
  }

  async deleteByUserAndMovie(userId: string, movieId: number): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .delete()
      .from(FavoriteEntity)
      .where('userId = :userId AND movie_id = :movieId', { userId, movieId })
      .execute();
  }

  async listUserFavorites(userId: string, params: ListMoviesParams): Promise<Paginated<MovieListItem>> {
    const page = Math.max(1, Number(params.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(params.limit ?? 10)));
    const offset = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('f')
      .innerJoin('f.movie', 'm')
      .leftJoin('m.genres', 'g')
      .leftJoin('ratings', 'r', 'r.movie_id = m.id')
      .select([
        'm.id AS id',
        'm.tmdbId AS "tmdbId"',
        'm.title AS title',
        'm.releaseDate AS "releaseDate"',
      ])
      .addSelect('AVG(r.value)', 'averageRating')
      .where('f.userId = :userId', { userId });

    if (params.q) {
      qb.andWhere('m.title ILIKE :q', { q: `%${params.q}%` });
    }
    if (params.genreId) {
      qb.andWhere('g.id = :genreId', { genreId: params.genreId });
    }

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

    // count distinct movies favorited by user with same filters
    const countQb = this.repo.createQueryBuilder('f')
      .innerJoin('f.movie', 'm')
      .leftJoin('m.genres', 'g')
      .where('f.userId = :userId', { userId })
      .select('m.id')
      .distinct(true);
    if (params.q) countQb.andWhere('m.title ILIKE :q', { q: `%${params.q}%` });
    if (params.genreId) countQb.andWhere('g.id = :genreId', { genreId: params.genreId });
    const total = await countQb.getCount();

    const data: MovieListItem[] = rows.map(r => ({
      id: Number(r.id),
      tmdbId: Number(r.tmdbId),
      title: r.title,
      releaseDate: r.releaseDate ? new Date(r.releaseDate) : null,
      averageRating: r.averageRating != null ? Number(r.averageRating) : null,
    }));

    return { data, page, limit, total };
  }
}
