import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('genres')
export class GenreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120, unique: true })
  name: string;
}