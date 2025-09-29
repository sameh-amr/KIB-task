import { RemoveFavoriteHandler } from '../remove-favorite.handler';
import { RemoveFavoriteCommand } from '../remove-favorite.command';

describe('RemoveFavoriteHandler (colocated test)', () => {
  const favorites = { deleteByUserAndMovie: jest.fn() };
  const cache = { updateFavoritesAfterRemove: jest.fn() };
  let handler: RemoveFavoriteHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new RemoveFavoriteHandler(favorites as any, cache as any);
  });

  it('deletes favorite and updates cache', async () => {
    const res = await handler.execute(new RemoveFavoriteCommand('u1', 7));
    expect(favorites.deleteByUserAndMovie).toHaveBeenCalledWith('u1', 7);
    expect(cache.updateFavoritesAfterRemove).toHaveBeenCalledWith('u1', 7);
    expect(res).toEqual({ ok: true });
  });
});
