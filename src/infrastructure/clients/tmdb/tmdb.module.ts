import { Module } from '@nestjs/common';
import { HttpModule, HttpModuleOptions } from '@nestjs/axios';
import { TmdbService } from './tmdb.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: (): HttpModuleOptions => ({
        baseURL: 'https://api.themoviedb.org/3',
        headers: {
          // v4 bearer is useful; we’ll still pass api_key for v3 endpoints
          Authorization: `Bearer ${process.env.TMDB_READ_TOKEN ?? ''}`,
          Accept: 'application/json',
        },
        timeout: 10000,
      }),
    }),
  ],
  providers: [TmdbService],
  exports: [TmdbService],
})
export class TmdbModule {}
