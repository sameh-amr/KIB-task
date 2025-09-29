import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { Rating } from '../../../domain/models/rating';
import type { NewRating } from '../../../domain/models/new-rating';
import { RatingRepository } from '../../../domain/repositories/rating.repository';

import { RatingEntity } from '../entities/rating.entity';
import { MovieEntity } from '../entities/movie.entity';
import { BaseTypeormRepository } from './base.repository';
import { Mapper } from '../mappers/mapper';

const RatingMapper: Mapper<Rating, RatingEntity, NewRating> = {
  toDomain: (e) => ({
    id: e.id,
    movieId: e.movie.id,
    userId: e.userId,
    value: e.value,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }),
  toEntity: (r) => {
    const e = new RatingEntity();
    if ((r as any).id !== undefined) e.id = (r as any).id;
    // Only connect by id; repo methods will load relations as needed
    e.movie = { id: r.movieId } as MovieEntity;
    e.userId = r.userId;
    e.value = r.value;
    return e;
  },
  fromCreate: (data) => {
    const e = new RatingEntity();
    e.movie = { id: data.movieId } as MovieEntity;
    e.userId = data.userId;
    e.value = data.value;
    return e;
  },
};

@Injectable()
export class TypeormRatingRepository
  extends BaseTypeormRepository<Rating, RatingEntity, number, NewRating>
  implements RatingRepository
{
  constructor(
    @InjectRepository(RatingEntity) repo: Repository<RatingEntity>,
    @InjectRepository(MovieEntity) private readonly movieRepo: Repository<MovieEntity>,
  ) {
    super(repo, RatingMapper);
  }

  async findByUserAndMovie(userId: string, movieId: number): Promise<Rating | null> {
    const row = await this.repo.findOne({
      where: { userId, movie: { id: movieId } },
      relations: { movie: true },
    });
    return row ? this.mapper.toDomain(row) : null;
  }

  async upsert(data: NewRating): Promise<Rating> {
    const existing = await this.repo.findOne({
      where: { userId: data.userId, movie: { id: data.movieId } },
      relations: { movie: true },
    });
    if (existing) {
      existing.value = data.value;
      const saved = await this.repo.save(existing);
      return this.mapper.toDomain(saved);
    }
    const created = await this.create(data); // base create<C>()
    return created;
  }

  async getAverageForMovie(movieId: number): Promise<number | null> {
    const { avg } = await this.repo
      .createQueryBuilder('r')
      .select('AVG(r.value)', 'avg')
      .where('r.movie_id = :movieId', { movieId })
      .getRawOne<{ avg: string | null }>();
    return avg ? Number(avg) : null;
  }
}
