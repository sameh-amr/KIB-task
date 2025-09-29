import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { Genre } from '../../../domain/models/genre';
import { GenreRepository } from '../../../domain/repositories/genre.repository';

import { GenreEntity } from '../entities/genre.entity';
import { BaseTypeormRepository } from './base.repository';
import { Mapper } from '../mappers/mapper';
import type { NewGenre } from '../../../domain/models/new-genre';


const GenreMapper: Mapper<Genre, GenreEntity, NewGenre> = {
  toDomain: (e) => ({ id: e.id, name: e.name }),
  toEntity: (g) => {
    const e = new GenreEntity();
    if ((g as any).id !== undefined) e.id = (g as any).id;
    e.name = g.name;
    return e;
  },
  fromCreate: (data) => {
    const e = new GenreEntity();
    e.name = data.name;
    return e;
  },
};

@Injectable()
export class TypeormGenreRepository
  extends BaseTypeormRepository<Genre, GenreEntity, number, NewGenre>
  implements GenreRepository
{
  constructor(
    @InjectRepository(GenreEntity) repo: Repository<GenreEntity>,
  ) {
    super(repo, GenreMapper);
  }
  create(data: Genre): Promise<Genre> {
    throw new Error('Method not implemented.');
  }

  async findByName(name: string): Promise<Genre | null> {
    const entity = await this.repo.findOne({ where: { name } });
    return entity ? this.mapper.toDomain(entity) : null;
  }
}
