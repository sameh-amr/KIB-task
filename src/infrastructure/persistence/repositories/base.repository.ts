import { Repository } from 'typeorm';
import { Mapper } from '../mappers/mapper';

export abstract class BaseTypeormRepository<
  D,
  E extends { id: Id },
  Id = number,
  C = D
> {
  protected constructor(
    protected readonly repo: Repository<E>,
    protected readonly mapper: Mapper<D, E, C>,
  ) {}

  async findById(id: Id): Promise<D | null> {
    const entity = await this.repo.findOne({ where: { id } as any });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findAll(): Promise<D[]> {
    const rows = await this.repo.find();
    return rows.map((r) => this.mapper.toDomain(r));
  }

  async save(model: D): Promise<D> {
    const saved = await this.repo.save(this.mapper.toEntity(model));
    return this.mapper.toDomain(saved);
  }

  async create(data: C): Promise<D> {
    const entity = this.mapper.fromCreate(data);
    const saved = await this.repo.save(entity);
    return this.mapper.toDomain(saved);
  }
}
