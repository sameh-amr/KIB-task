import { RateMovieHandler } from '../rate-movie.handler';
import { RateMovieCommand } from '../rate-movie.command';

describe('RateMovieHandler (colocated test)', () => {
  const movies = { findById: jest.fn() };
  const ratings = { upsert: jest.fn(), getAverageForMovie: jest.fn() };
  const cache = { patchAverageForMovie: jest.fn() };
  let handler: RateMovieHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new RateMovieHandler(movies as any, ratings as any, cache as any);
  });

  it('upserts rating, patches cache, returns average', async () => {
    movies.findById.mockResolvedValue({ id: 42 });
    ratings.upsert.mockResolvedValue({});
    ratings.getAverageForMovie.mockResolvedValue(4.5);

    const res = await handler.execute(new RateMovieCommand(42, 'u1', 5));

    expect(movies.findById).toHaveBeenCalledWith(42);
    expect(ratings.upsert).toHaveBeenCalledWith({ movieId: 42, userId: 'u1', value: 5 });
    expect(cache.patchAverageForMovie).toHaveBeenCalledWith(42, 4.5);
    expect(res).toEqual({ ok: true, movieId: 42, averageRating: 4.5 });
  });
});
