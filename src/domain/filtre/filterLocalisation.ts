import { Echelle } from '../../domain/aides/echelle';
import { CommuneRepository } from '../../infrastructure/repository/commune/commune.repository';

export class FilterLocalisation {
  code_postal?: string;
  code_region?: string;
  code_departement?: string;
  code_commune?: string;
  commune_pour_partenaire?: string;
  region_pour_partenaire?: string;
  departement_pour_partenaire?: string;
  cu_ca_cc_mode?: boolean;
  echelle?: Echelle;

  constructor(filter?: FilterLocalisation) {
    Object.assign(this, filter);
  }

  public static build(
    code_postal: string,
    code_commune: string,
  ): FilterLocalisation {
    const dept_region =
      CommuneRepository.findDepartementRegionByCodeCommune(code_commune);

    return new FilterLocalisation({
      code_postal: code_postal,
      code_commune: code_commune,
      code_departement: dept_region?.code_departement,
      code_region: dept_region?.code_region,
      commune_pour_partenaire: code_commune,
      departement_pour_partenaire: dept_region?.code_departement,
      region_pour_partenaire: dept_region?.code_region,
      cu_ca_cc_mode: true,
    });
  }

  public static buildSearchQueryClauses(filtre: FilterLocalisation): any[] {
    const clauses = [];

    if (filtre.code_region) {
      clauses.push({
        OR: [
          { codes_region_from_partenaire: { isEmpty: false } },
          { codes_region: { has: filtre.code_region } },
          { codes_region: { isEmpty: true } },
        ],
      });
    }

    if (filtre.code_departement) {
      clauses.push({
        OR: [
          { codes_departement_from_partenaire: { isEmpty: false } },
          { codes_departement: { has: filtre.code_departement } },
          { codes_departement: { isEmpty: true } },
        ],
      });
    }

    if (filtre.code_commune) {
      clauses.push({
        OR: [
          { codes_commune_from_partenaire: { isEmpty: false } },
          { include_codes_commune: { isEmpty: true } },
          { include_codes_commune: { has: filtre.code_commune } },
        ],
      });
      clauses.push({
        OR: [
          { codes_commune_from_partenaire: { isEmpty: false } },
          { exclude_codes_commune: { isEmpty: true } },
          { NOT: { exclude_codes_commune: { has: filtre.code_commune } } },
        ],
      });
    }

    if (filtre.cu_ca_cc_mode) {
      if (filtre.code_postal) {
        clauses.push({
          OR: [
            { codes_postaux: { has: filtre.code_postal } },
            { codes_postaux: { isEmpty: true } },
            {
              echelle: {
                not: {
                  in: [
                    'Communauté de communes',
                    'Communauté urbaine',
                    "Communauté d'agglomération",
                  ],
                },
              },
            },
          ],
        });
      }
    } else {
      if (filtre.code_postal) {
        clauses.push({
          OR: [
            { codes_postaux: { has: filtre.code_postal } },
            { codes_postaux: { isEmpty: true } },
          ],
        });
      }
    }

    if (filtre.echelle) {
      clauses.push({
        echelle: filtre.echelle,
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
          // FIXME: why is this needed?
          {
            echelle: {
              in: [
                'Communauté de communes',
                'Communauté urbaine',
                "Communauté d'agglomération",
              ],
            },
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
