import type { NewGenre } from '../../../../domain/models/new-genre';
export class UpsertGenresCommand {
  constructor(public readonly items: NewGenre[]) {}
}
