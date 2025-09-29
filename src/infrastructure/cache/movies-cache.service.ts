import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

type ListPayload = { data?: any[]; page?: number; limit?: number; total?: number };

@Injectable()
export class MoviesCacheService {
  private readonly moviesPrefix = 'movies:list:';
  private readonly favPrefix = 'favorites:list:';

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  private get store(): any {
    return (this.cache as any).store; 
  }

  private async keysByPrefix(prefix: string): Promise<string[]> {
    const keys: string[] = (await this.store.keys()) ?? [];
    return keys.filter((k) => k.startsWith(prefix));
  }

  buildMoviesKey(q?: string, genreId?: number, page?: number, limit?: number) {
    return `${this.moviesPrefix}${q ?? ''}|${genreId ?? ''}|${page ?? 1}|${limit ?? 10}`;
  }

  buildFavoritesKey(userId: string, q?: string, genreId?: number, page?: number, limit?: number) {
    return `${this.favPrefix}${userId}|${q ?? ''}|${genreId ?? ''}|${page ?? 1}|${limit ?? 10}`;
  }

  async get<T>(key: string): Promise<T | null> {
    return ((await this.cache.get<T>(key)) as T) ?? null;
  }

  async set<T>(key: string, value: T, ttlMs: number = Number(process.env.CACHE_TTL_MS ?? 60_000)): Promise<void> {

    const ttlSec = Math.max(1, Math.floor(ttlMs / 1000));
    await this.cache.set(key, value, { ttl: ttlSec } as any);
  }

  async resetAll(): Promise<void> {
    // v4 uses reset()
    if (typeof (this.cache as any).reset === 'function') {
      await (this.cache as any).reset();
    } else if (typeof this.store?.reset === 'function') {
      await this.store.reset();
    }
  }


  async patchAverageForMovie(movieId: number, avg: number | null): Promise<void> {
    const keys = await this.keysByPrefix(this.moviesPrefix);
    for (const key of keys) {
      const payload = (await this.cache.get<ListPayload>(key)) ?? null;
      if (!payload?.data || !Array.isArray(payload.data)) continue;

      let changed = false;
      for (const item of payload.data) {
        if (item?.id === movieId) {
          item.averageRating = avg;
          changed = true;
        }
      }
      if (changed) {
        await this.set(key, payload); 
      }
    }
  }


  async updateFavoritesAfterAdd(
    userId: string,
    item: { id: number; tmdbId: number; title: string; releaseDate: Date | null; averageRating: number | null },
  ): Promise<void> {
    const userPrefix = `${this.favPrefix}${userId}|`;
    const keys = await this.keysByPrefix(userPrefix);

    for (const key of keys) {
      const parts = key.slice(this.favPrefix.length).split('|'); 
      const [uid, q, genreIdStr, pageStr, limitStr] = parts;
      if (uid !== userId) continue;

      const page = Number(pageStr || '1');
      const limit = Number(limitStr || '10');
      const hasGenreFilter = !!genreIdStr;
      if (page !== 1 || hasGenreFilter) continue;

      if (q && !item.title.toLowerCase().includes(q.toLowerCase())) continue;

      const payload = (await this.cache.get<ListPayload>(key)) ?? null;
      if (!payload?.data) continue;

      if (payload.data.some((m) => m?.id === item.id)) continue;

      payload.data.unshift(item);
      if (payload.data.length > limit) payload.data.pop();
      payload.total = (payload.total ?? payload.data.length) + 1 - 0; // ensure numeric
      await this.set(key, payload);
    }
  }


  async updateFavoritesAfterRemove(userId: string, movieId: number): Promise<void> {
    const userPrefix = `${this.favPrefix}${userId}|`;
    const keys = await this.keysByPrefix(userPrefix);

    for (const key of keys) {
      const payload = (await this.cache.get<ListPayload>(key)) ?? null;
      if (!payload?.data) continue;

      const before = payload.data.length;
      payload.data = payload.data.filter((m) => m?.id !== movieId);
      if (payload.data.length === before) continue;

      if (typeof payload.total === 'number' && payload.total > 0) payload.total -= 1;
      await this.set(key, payload);
    }
  }
}
