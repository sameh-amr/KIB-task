export interface Mapper<D, E, C = D> {
  toDomain(entity: E): D;
  toEntity(domain: D): E;
  fromCreate(data: C): E;
}
