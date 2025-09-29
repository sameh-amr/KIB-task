import { ListMoviesHandler } from '../list-movies.handler';
import { ListMoviesQuery } from '../list-movies.query';

describe('ListMoviesHandler (colocated test)', () => {
  const movies = { search: jest.fn() };
  const cache = {
    buildMoviesKey: jest.fn((q,g,p,l) => `movies:list:${q}|${g}|${p}|${l}`),
    get: jest.fn(),
    set: jest.fn(),
  };
  let handler: ListMoviesHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new ListMoviesHandler(movies as any, cache as any);
  });

  it('cache miss → queries repo and caches', async () => {
    cache.get.mockResolvedValue(null);
    movies.search.mockResolvedValue({ data: [], page: 1, limit: 10, total: 0 });

    const res = await handler.execute(new ListMoviesQuery('man', 28, 1, 10));

    expect(cache.get).toHaveBeenCalled();
    expect(movies.search).toHaveBeenCalledWith({ q: 'man', genreId: 28, page: 1, limit: 10 });
    expect(cache.set).toHaveBeenCalled();
    expect(res.page).toBe(1);
  });

  it('cache hit → returns cached, no repo call', async () => {
    const cached = { data: [{ id: 1 }], page: 1, limit: 10, total: 1 };
    cache.get.mockResolvedValue(cached);

    const res = await handler.execute(new ListMoviesQuery(undefined, undefined, 1, 10));

    expect(movies.search).not.toHaveBeenCalled();
    expect(res).toBe(cached);
  });
});
