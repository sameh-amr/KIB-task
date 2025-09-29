import { Column, Entity, PrimaryGeneratedColumn, Index, ManyToMany } from 'typeorm';
import { MovieEntity } from './movie.entity';

@Entity('genres')
export class GenreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'int', nullable: true })
  tmdbId: number | null;

  @Column({ type: 'varchar', length: 120, unique: true })
  name: string;

  @ManyToMany(() => MovieEntity, (m) => m.genres, { cascade: false })
  movies?: MovieEntity[];
}
