import { BaseRepository } from './base.repository';
import type { Favorite } from '../models/favorite';
import type { NewFavorite } from '../models/new-favorite';
import type { ListMoviesParams, Paginated, MovieListItem } from '../models/lists/movie-listing';

export abstract class FavoriteRepository extends BaseRepository<Favorite, number, NewFavorite> {
  abstract isFavorite(userId: string, movieId: number): Promise<boolean>;
  abstract deleteByUserAndMovie(userId: string, movieId: number): Promise<void>;
  abstract listUserFavorites(userId: string, params: ListMoviesParams): Promise<Paginated<MovieListItem>>;
}
