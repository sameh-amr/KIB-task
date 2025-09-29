export type ListMoviesParams = {
  q?: string;        
  genreId?: number;  
  page?: number;     
  limit?: number; 
};

export type MovieListItem = {
  id: number;
  tmdbId: number;
  title: string;
  releaseDate: Date | null;
  averageRating: number | null;
};

export type Paginated<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
};
