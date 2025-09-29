
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { GenreEntity } from './src/infrastructure/persistence/entities/genre.entity';
import { MovieEntity } from './src/infrastructure/persistence/entities/movie.entity';
import { RatingEntity } from './src/infrastructure/persistence/entities/rating.entity';
import { FavoriteEntity } from './src/infrastructure/persistence/entities/favorite.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT || 5432),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'kib',
  entities: [GenreEntity, MovieEntity, RatingEntity, FavoriteEntity],
  migrations: [join(__dirname, 'src/migrations/*.{js,ts}')],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: false,
});
