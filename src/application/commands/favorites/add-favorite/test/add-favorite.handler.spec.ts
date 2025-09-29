import { AddFavoriteHandler } from '../add-favorite.handler';
import { AddFavoriteCommand } from '../add-favorite.command';

describe('AddFavoriteHandler (colocated test)', () => {
  const favorites = { isFavorite: jest.fn(), create: jest.fn() };
  const movies = { findById: jest.fn() };
  const ratings = { getAverageForMovie: jest.fn() };
  const cache = { updateFavoritesAfterAdd: jest.fn() };
  let handler: AddFavoriteHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new AddFavoriteHandler(favorites as any, movies as any, cache as any, ratings as any);
  });

  it('creates favorite and updates cache when not existing', async () => {
    movies.findById.mockResolvedValue({ id: 7, tmdbId: 700, title: 'X', releaseDate: null });
    favorites.isFavorite.mockResolvedValue(false);
    ratings.getAverageForMovie.mockResolvedValue(3);

    const res = await handler.execute(new AddFavoriteCommand('u1', 7));

    expect(favorites.create).toHaveBeenCalledWith({ userId: 'u1', movieId: 7 });
    expect(cache.updateFavoritesAfterAdd).toHaveBeenCalled();
    expect(res).toEqual({ ok: true });
  });
});
