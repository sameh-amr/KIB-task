import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { GenresController } from './http/genres.controller';
import { MoviesController } from './http/movies.controller';
import { FavoritesController } from './http/favorites.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [GenresController,MoviesController,FavoritesController],
})
export class InterfaceModule {}
