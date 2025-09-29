import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ListGenresHandler } from './queries/genres/list-genres.handler';
import { PersistenceModule } from '../infrastructure/persistence/persistence.module';

@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [ListGenresHandler],
  exports: [CqrsModule],
})
export class ApplicationModule {}
