export class ListMoviesQuery {
  constructor(
    public readonly q?: string,
    public readonly genreId?: number,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
