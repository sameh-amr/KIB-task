export interface Mapper<D, E> {
  toDomain(entity: E): D;
  toEntity(domain: D): E;
}
