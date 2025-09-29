export abstract class BaseRepository<T, Id = number> {
  abstract findById(id: Id): Promise<T | null>;
  abstract findAll(): Promise<T[]>;
  abstract save(entity: T): Promise<T>;
}
