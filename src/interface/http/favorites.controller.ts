import { Controller, Get, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ListFavoritesQuery } from '../../application/queries/favorites/list-favorites/list-favorites.query';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async list(
    @Query('userId') userId?: string,
    @Query('q') q?: string,
    @Query('genreId') genreIdRaw?: string,
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    if (!userId) throw new BadRequestException('userId is required');
    const genreId = genreIdRaw ? Number(genreIdRaw) : undefined;
    const page = pageRaw ? Number(pageRaw) : undefined;
    const limit = limitRaw ? Number(limitRaw) : undefined;

    return this.queryBus.execute(new ListFavoritesQuery(userId, q, genreId, page, limit));
  }
}
