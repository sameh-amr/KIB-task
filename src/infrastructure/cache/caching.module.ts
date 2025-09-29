import { Module, CacheModule } from '@nestjs/common';
import { MoviesCacheService } from './movies-cache.service';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: Number(process.env.CACHE_TTL_MS ?? 60_000),
      max: 1000,
    }),
  ],
  providers: [MoviesCacheService],
  exports: [MoviesCacheService],
})
export class CachingModule {}
