import { Echelle } from '../../domain/aides/echelle';
import { CommuneRepository } from './commune/commune.repository';

export class GeographicSQLFilter {
  public static generateClauses(
    code_postal: string,
    code_commune: string,
    echelle?: Echelle,
  ): any[] {
    const clauses = [];

    const dep =
      CommuneRepository.findDepartementRegionByCodeCommune(code_commune);
    const code_departement = dep?.code_departement;
    const code_region = dep?.code_region;

    if (echelle) {
      clauses.push({
        echelle: echelle,
      });
    }

    if (code_commune) {
      clauses.push({
        OR: [
          { exclude_codes_commune: { isEmpty: true } },
          { NOT: { exclude_codes_commune: { has: code_commune } } },
        ],
      });
      clauses.push({
        OR: [
          {
            codes_commune_from_partenaire: {
              has: code_commune,
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
    if (code_postal) {
      clauses.push({
        OR: [
          { codes_postaux: { has: code_postal } },
          { codes_postaux: { isEmpty: true } },
          { NOT: { echelle: Echelle['Communauté de communes'] } },
        ],
      });
    }

    if (code_departement) {
      clauses.push({
        OR: [
          {
            codes_departement_from_partenaire: {
              has: code_departement,
            },
          },
          { codes_departement_from_partenaire: { isEmpty: true } },
        ],
      });
    }

    if (code_region) {
      clauses.push({
        OR: [
          {
            codes_region_from_partenaire: {
              has: code_region,
            },
          },
          { codes_region_from_partenaire: { isEmpty: true } },
        ],
      });
    }

    return clauses;
  }
}
