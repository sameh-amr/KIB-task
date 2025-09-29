export class RateMovieCommand {
  constructor(
    public readonly movieId: number,
    public readonly userId: string,
    public readonly rating: number,
  ) {}
}
