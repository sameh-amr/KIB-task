import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, Unique, JoinColumn } from 'typeorm';
import { MovieEntity } from './movie.entity';

@Entity('ratings')
@Unique('UQ_ratings_user_movie', ['userId', 'movie'])
export class RatingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MovieEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movie_id' })
  @Index('IDX_ratings_movie')
  movie: MovieEntity;

  @Column({ type: 'varchar', length: 128 })
  @Index('IDX_ratings_user')
  userId: string;

  @Column({ type: 'smallint' })
  value: number; // we'll enforce 1..5 via a CHECK in migration

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
