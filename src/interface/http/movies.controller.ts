import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
  Query,
  Post,
  Body,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ListMoviesQuery } from '../../application/queries/movies/list-movies/list-movies.query';
import { GetMovieQuery } from '../../application/queries/movies/get-movie/get-movie.query';
import { RateMovieCommand } from '../../application/commands/ratings/rate-movie/rate-movie.command';
import { AddFavoriteCommand } from '../../application/commands/favorites/add-favorite/add-favorite.command';
import { RemoveFavoriteCommand } from '../../application/commands/favorites/remove-favorite/remove-favorite.command';
import { ApiBody } from '@nestjs/swagger';
import { RateMovieDto } from './dto/rate-movie.dto';
import { FavoriteDto } from './dto/favorite.dto';

type RateBody = { userId: string; rating: number };
type FavoriteBody = { userId: string };

@Controller('movies')
export class MoviesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async list(
    @Query('q') q?: string,
    @Query('genreId') genreIdRaw?: string,
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    const genreId = genreIdRaw ? Number(genreIdRaw) : undefined;
    const page = pageRaw ? Number(pageRaw) : undefined;
    const limit = limitRaw ? Number(limitRaw) : undefined;
    return this.queryBus.execute(new ListMoviesQuery(q, genreId, page, limit));
  }

  @Get(':id')
  async byId(@Param('id', ParseIntPipe) id: number) {
    const movie = await this.queryBus.execute(new GetMovieQuery(id));
    if (!movie) throw new NotFoundException('Movie not found');
    return movie;
  }
  @ApiBody({ type: RateMovieDto })
  @Post(':id/ratings')
  async rate(@Param('id', ParseIntPipe) id: number, @Body() body: RateBody) {
    if (!body?.userId || typeof body.userId !== 'string') {
      throw new BadRequestException('userId is required');
    }
    const rating = Number((body as any).rating);
    return this.commandBus.execute(
      new RateMovieCommand(id, body.userId, rating),
    );
  }
  @Post(':id/favorite')
  @ApiBody({ type: FavoriteDto })
  async addFavorite(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: FavoriteBody,
  ) {
    return this.commandBus.execute(new AddFavoriteCommand(body.userId, id));
  }

  @Delete(':id/favorite')
  @ApiBody({ type: FavoriteDto })
  async removeFavorite(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: FavoriteBody,
  ) {
    return this.commandBus.execute(new RemoveFavoriteCommand(body.userId, id));
  }
}
