/**
 * Interfaces to unify operations on data entities associated with at least one partenaire.
 *
 * A partenaire is an entity corresponding to a partner organization or service
 * that provides content or services related to the linked entity. It allows to
 * map the entity to its corresponding localization (city, department, region).
 *
 * As data entities doesn't have direct information about their geographical
 * area, it's necessary to compute all the geographical codes from the
 * associated partenaires.
 */

interface AssociatedWithPartenaires {
  getPartenaireIds(): string[];
}

interface WithPartenaireCodes<T extends AssociatedWithPartenaires> {
  /**
   * Recompute the geographical codes (e.g. city INSEE codes, department codes,
   * region codes) from the associated partenaires for an entity associated with
   * a partenaire.
   *
   * @param cms_id - The ID in the CMS of the entity to update.
   * @param codes_commune - The list of INSEE codes of the communes associated with the entity.
   * @param codes_departement_from_partenaire - The list of department codes from the partenaires associated with the entity.
   * @param codes_region_from_partenaire - The list of region codes from the partenaires associated with the entity.
   */
  updateCodesFromPartenaireFor(
    cms_id: string,
    codes_commune: string[],
    codes_departement_from_partenaire: string[],
    codes_region_from_partenaire: string[],
  ): Promise<void>;

  /**
   * Find all entities associated with a given partenaire ID.
   *
   * @param partenaire_id - The ID of the partenaire to search for.
   * @returns A promise that resolves to an array of entities associated with the given partenaire ID.
   */
  findByPartenaireId(partenaire_id: string): Promise<T[]>;
}
