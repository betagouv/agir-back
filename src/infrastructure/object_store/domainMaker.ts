export interface DomainMaker<DomainType> {
  version: number;

  toDomain(): Promise<DomainType>;
}
