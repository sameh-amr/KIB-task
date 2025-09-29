export abstract class BaseRepository<T, Id = number, C = T> {
  abstract findById(id: Id): Promise<T | null>;
  abstract findAll(): Promise<T[]>;
  abstract save(entity: T): Promise<T>;
  abstract create(data: C): Promise<T>;
}
