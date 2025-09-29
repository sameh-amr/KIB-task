export class AddFavoriteCommand {
  constructor(
    public readonly userId: string,
    public readonly movieId: number,
  ) {}
}
