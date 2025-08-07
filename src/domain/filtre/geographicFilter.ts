import { CommuneRepository } from '../../infrastructure/repository/commune/commune.repository';
import { Echelle } from '../aides/echelle';

export class GeographicFilter {
  code_postal?: string;
  code_commune?: string;
  code_departement?: string;
  code_region?: string;
  echelle?: Echelle;

  protected constructor(
    code_postal: string,
    code_commune: string,
    echelle?: Echelle,
  ) {
    const dep =
      CommuneRepository.findDepartementRegionByCodeCommune(code_commune);
    this.code_postal = code_postal;
    this.code_commune = code_commune;
    this.code_departement = dep?.code_departement;
    this.code_region = dep?.code_region;
    this.echelle = echelle;
  }

  // NOTE: pour plus d'information sur les règles de filtration, voir /docs/filtre-geographique.md.
  // (Penser à mettre à jour ce fichier si vous modifiez les règles de filtration).
  protected static getSearchClauses(filtre: GeographicFilter): any[] {
    const clauses = [];

    if (filtre.echelle) {
      clauses.push({
        echelle: filtre.echelle,
      });
    }

    if (filtre.code_commune) {
      clauses.push({
        OR: [
          { exclude_codes_commune: { isEmpty: true } },
          { NOT: { exclude_codes_commune: { has: filtre.code_commune } } },
        ],
      });
      clauses.push({
        OR: [
          {
            codes_commune_from_partenaire: {
              has: filtre.code_commune,
            },
          },
          { codes_commune_from_partenaire: { isEmpty: true } },
          {
            // NOTE: ne devrait pas être utilisé, mais dans le cas ou l'aide
            // d'une CC à un partenaire mais pas de codes postaux renseignée,
            // nous utilisons le partenaire pour filtrer.
            AND: [
              { echelle: Echelle['Communauté de communes'] },
              { codes_postaux: { isEmpty: false } },
            ],
          },
        ],
      });
    }

    // NOTE: pour les CC on utilise uniquement les codes postaux pour filtrer.
    // FIXME: nous devrions utiliser les codes INSEE ou les partenaires.
    if (filtre.code_postal) {
      clauses.push({
        OR: [
          { codes_postaux: { has: filtre.code_postal } },
          { codes_postaux: { isEmpty: true } },
          { NOT: { echelle: Echelle['Communauté de communes'] } },
        ],
      });
    }

    if (filtre.code_departement) {
      clauses.push({
        OR: [
          {
            codes_departement_from_partenaire: {
              has: filtre.code_departement,
            },
          },
          { codes_departement_from_partenaire: { isEmpty: true } },
        ],
      });
    }

    if (filtre.code_region) {
      clauses.push({
        OR: [
          {
            codes_region_from_partenaire: {
              has: filtre.code_region,
            },
          },
          { codes_region_from_partenaire: { isEmpty: true } },
        ],
      });
    }

    return clauses;
  }
}
