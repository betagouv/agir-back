import { CommuneRepository } from '../../infrastructure/repository/commune/commune.repository';
import { Echelle } from '../aides/echelle';

export class GeographicFilter {
  code_postal?: string;
  code_region?: string;
  code_departement?: string;
  code_commune?: string;
  commune_pour_partenaire?: string;
  region_pour_partenaire?: string;
  departement_pour_partenaire?: string;
  echelle?: Echelle;

  constructor(filter?: GeographicFilter) {
    Object.assign(this, filter);
  }

  public static build(
    code_postal: string,
    code_commune: string,
  ): GeographicFilter {
    const dept_region =
      CommuneRepository.findDepartementRegionByCodeCommune(code_commune);

    return new GeographicFilter({
      code_postal: code_postal,
      code_commune: code_commune,
      code_departement: dept_region?.code_departement,
      code_region: dept_region?.code_region,
      commune_pour_partenaire: code_commune,
      departement_pour_partenaire: dept_region?.code_departement,
      region_pour_partenaire: dept_region?.code_region,
    });
  }

  // NOTE: pour plus d'information sur les règles de filtration, voir /docs/filtre-geographique.md.
  public static buildSearchQueryClauses(filtre: GeographicFilter): any[] {
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

    if (filtre.commune_pour_partenaire) {
      clauses.push({
        OR: [
          {
            codes_commune_from_partenaire: {
              has: filtre.commune_pour_partenaire,
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

    if (filtre.departement_pour_partenaire) {
      clauses.push({
        OR: [
          {
            codes_departement_from_partenaire: {
              has: filtre.departement_pour_partenaire,
            },
          },
          { codes_departement_from_partenaire: { isEmpty: true } },
        ],
      });
    }

    if (filtre.region_pour_partenaire) {
      clauses.push({
        OR: [
          {
            codes_region_from_partenaire: {
              has: filtre.region_pour_partenaire,
            },
          },
          { codes_region_from_partenaire: { isEmpty: true } },
        ],
      });
    }

    return clauses;
  }
}
