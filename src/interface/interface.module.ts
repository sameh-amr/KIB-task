import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { GenresController } from './http/genres.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [GenresController],
})
export class InterfaceModule {}
