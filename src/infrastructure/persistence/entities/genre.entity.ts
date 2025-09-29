import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('genres')
export class GenreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'int', nullable: true }) // nullable for smooth migration; we’ll enforce uniqueness where not null
  tmdbId: number | null;
  @Column({ type: 'varchar', length: 120, unique: true })
  name: string;
}
