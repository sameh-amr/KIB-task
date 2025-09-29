import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

type TmdbGenre = { id: number; name: string };
type TmdbMovie = { id: number; title: string; release_date?: string | null, genre_ids?: number[];};

@Injectable()
export class TmdbService {
  constructor(private readonly http: HttpService) {}

  async fetchGenres(): Promise<TmdbGenre[]> {
    const res$ = this.http.get('/genre/movie/list', {
      params: { api_key: process.env.TMDB_API_KEY },
    });
    const { data } = await lastValueFrom(res$);
    return data?.genres ?? [];
  }

  async fetchPopularMovies(page = 1): Promise<TmdbMovie[]> {
    const res$ = this.http.get('/movie/popular', {
      params: { api_key: process.env.TMDB_API_KEY, page },
    });
    const { data } = await lastValueFrom(res$);
    return data?.results ?? [];
  }
}
