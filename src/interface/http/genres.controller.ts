import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ListGenresQuery } from '../../application/queries/genres/list-genres.query';

@Controller('genres')
export class GenresController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async list() {
    return this.queryBus.execute(new ListGenresQuery());
  }
}
