import { Module, CacheModule as NestCacheModule } from '@nestjs/common';
import { MoviesCacheService } from './movies-cache.service';

@Module({
  imports: [
    // Memory cache for now; TTL is in milliseconds for cache-manager v5.
    NestCacheModule.register({
      isGlobal: true,
      ttl: Number(process.env.CACHE_TTL_MS ?? 60_000),
      max: 1000,
    }),
  ],
  providers: [MoviesCacheService],
  exports: [MoviesCacheService],
})
export class CachingModule {}
