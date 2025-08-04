interface Paginated<T> {
  countAll(): Promise<number>;
  listePaginated(skip: number, take: number): Promise<T[]>;
  listeAll(): Promise<T[]>;
}

interface AssociatedWithPartenaires {
  getPartenaireIds(): string[];
}

interface WithPartenaireCodes<T extends AssociatedWithPartenaires> {
  updateCodesFromPartenaireFor(
    cms_id: string,
    codes_commune: string[],
    codes_departement_from_partenaire: string[],
    codes_region_from_partenaire: string[],
  ): Promise<void>;
  findByPartenaireId(partenaire_id: string): Promise<T[]>;
  loadCache(): Promise<void>;
}
