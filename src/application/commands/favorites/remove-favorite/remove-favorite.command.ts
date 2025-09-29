export class RemoveFavoriteCommand {
  constructor(
    public readonly userId: string,
    public readonly movieId: number,
  ) {}
}
