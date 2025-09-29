import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class MoviesCacheService {
  private readonly moviesPrefix = 'movies:list:';
  private readonly favPrefix = 'favorites:list:';

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  buildMoviesKey(q?: string, genreId?: number, page?: number, limit?: number) {
    return `${this.moviesPrefix}${q ?? ''}|${genreId ?? ''}|${page ?? 1}|${
      limit ?? 10
    }`;
  }

  buildFavoritesKey(
    userId: string,
    q?: string,
    genreId?: number,
    page?: number,
    limit?: number,
  ) {
    return `${this.favPrefix}${userId}|${q ?? ''}|${genreId ?? ''}|${
      page ?? 1
    }|${limit ?? 10}`;
  }

  async get<T>(key: string): Promise<T | null> {
    return (await this.cache.get<T>(key)) ?? null;
  }

  async set<T>(
    key: string,
    value: T,
    ttlMs: number = Number(process.env.CACHE_TTL_MS ?? 60_000),
  ): Promise<void> {
    await this.cache.set(key, value, ttlMs);
  }


  async resetAll(): Promise<void> {
    await this.cache.clear();
  }




async patchAverageForMovie(movieId: number, avg: number | null): Promise<void> {
  const now = Date.now();
  for (const [key, entry] of this.cache) {
    if (entry.expires <= now) { this.cache.delete(key); continue; }
    const payload = entry.value as { data?: Array<any>; total?: number };
    if (!payload?.data || !Array.isArray(payload.data)) continue;

    let changed = false;
    for (const item of payload.data) {
      if (item?.id === movieId) {
        item.averageRating = avg;
        changed = true;
      }
    }
    if (changed) this.cache.set(key, entry);
  }
}


async updateFavoritesAfterAdd(userId: string, item: {
  id: number; tmdbId: number; title: string; releaseDate: Date | null; averageRating: number | null;
}): Promise<void> {
  const now = Date.now();
  for (const [key, entry] of this.cache) {
    if (entry.expires <= now) { this.cache.delete(key); continue; }
    if (!key.startsWith(this.favPrefix)) continue;

    const parts = key.slice(this.favPrefix.length).split('|');
    const [uid, q, genreIdStr, pageStr, limitStr] = parts;
    if (uid !== userId) continue;


    const page = Number(pageStr || '1');
    const limit = Number(limitStr || '10');
    const hasGenreFilter = !!genreIdStr;
    if (page !== 1 || hasGenreFilter) continue;


    if (q && !item.title.toLowerCase().includes(q.toLowerCase())) continue;

    const payload = entry.value as { data: Array<any>; page: number; limit: number; total: number };
    if (!payload?.data) continue;

 
    if (payload.data.some((m) => m.id === item.id)) continue;


    payload.data.unshift(item);
    if (payload.data.length > limit) payload.data.pop();
    payload.total += 1;

    this.cache.set(key, entry);
  }
}


async updateFavoritesAfterRemove(userId: string, movieId: number): Promise<void> {
  const now = Date.now();
  for (const [key, entry] of this.cache) {
    if (entry.expires <= now) { this.cache.delete(key); continue; }
    if (!key.startsWith(this.favPrefix)) continue;

    const parts = key.slice(this.favPrefix.length).split('|');
    const [uid] = parts;
    if (uid !== userId) continue;

    const payload = entry.value as { data: Array<any>; page: number; limit: number; total: number };
    if (!payload?.data) continue;

    const before = payload.data.length;
    const filtered = payload.data.filter((m) => m.id !== movieId);
    if (filtered.length === before) continue; 
    payload.data = filtered;
    if (payload.total > 0) payload.total -= 1;

    this.cache.set(key, entry);
  }
}

}
