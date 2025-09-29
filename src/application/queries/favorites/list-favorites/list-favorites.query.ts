export class ListFavoritesQuery {
  constructor(
    public readonly userId: string,
    public readonly q?: string,
    public readonly genreId?: number,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
