import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { Genre } from '../../../domain/models/genre';
import { GenreRepository } from '../../../domain/repositories/genre.repository';

import { GenreEntity } from '../entities/genre.entity';
import { BaseTypeormRepository } from './base.repository';
import { Mapper } from '../mappers/mapper';

const GenreMapper: Mapper<Genre, GenreEntity> = {
  toDomain: (e) => ({ id: e.id, name: e.name }),
  toEntity: (g) => {
    const e = new GenreEntity();
    e.id = g.id;
    e.name = g.name;
    return e;
  },
};

@Injectable()
export class TypeormGenreRepository
  extends BaseTypeormRepository<Genre, GenreEntity>
  implements GenreRepository
{
  constructor(
    @InjectRepository(GenreEntity) repo: Repository<GenreEntity>,
  ) {
    super(repo, GenreMapper);
  }

  async findByName(name: string): Promise<Genre | null> {
    const entity = await this.repo.findOne({ where: { name } });
    return entity ? this.mapper.toDomain(entity) : null;
  }
}
