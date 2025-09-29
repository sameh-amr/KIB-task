import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('movies')
export class MovieEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ type: 'int', unique: true })
  tmdbId: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'date', nullable: true })
  releaseDate: Date | null;
}
