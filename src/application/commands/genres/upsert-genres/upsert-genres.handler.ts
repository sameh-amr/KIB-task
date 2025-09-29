import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpsertGenresCommand } from './upsert-genres.command';
import { GenreRepository } from '../../../../domain/repositories/genre.repository';

@CommandHandler(UpsertGenresCommand)
export class UpsertGenresHandler
  implements ICommandHandler<UpsertGenresCommand>
{
  constructor(private readonly genres: GenreRepository) {}
  async execute({
    items,
  }: UpsertGenresCommand): Promise<{ inserted: number; total: number }> {
    try {
      let inserted = 0;
      for (const g of items) {
        const exists = await this.genres.findByTmdbId(g.tmdbId);
        if (!exists) {
          await this.genres.create(g);
          inserted++;
        }
      }
      return { inserted, total: items.length };
    } catch (err) {
      console.log(err);
    }
  }
}
