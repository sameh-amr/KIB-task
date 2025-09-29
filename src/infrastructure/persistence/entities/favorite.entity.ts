import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { MovieEntity } from './movie.entity';

@Entity('favorites')
@Unique('UQ_favorites_user_movie', ['userId', 'movie'])
export class FavoriteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MovieEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movie_id' })
  @Index('IDX_favorites_movie')
  movie: MovieEntity;

  @Column({ type: 'varchar', length: 128 })
  @Index('IDX_favorites_user')
  userId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
