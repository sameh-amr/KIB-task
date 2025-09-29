import type { NewMovie } from '../../../../domain/models/new-movie';
export class UpsertMoviesCommand {
  constructor(public readonly items: NewMovie[]) {}
}
