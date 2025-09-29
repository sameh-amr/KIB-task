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

  /** Coarse invalidation: clear entire cache after writes (simple & safe). */
  async resetAll(): Promise<void> {
    await this.cache.clear();
  }
}
