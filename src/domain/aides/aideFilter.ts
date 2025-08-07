import { GeographicFilter } from '../filtre/geographicFilter';
import { Thematique } from '../thematique/thematique';

export class AideFilter extends GeographicFilter {
  maxNumber?: number;
  thematiques?: Thematique[];
  besoins?: string[];
  date_expiration?: Date;

  private constructor(filter: AideFilter) {
    super(filter.code_postal, filter.code_commune, filter.echelle);
    Object.assign(this, filter);
  }

  public static create(
    code_postal: string,
    code_commune: string,
    aide: AideFilter,
  ) {
    const filtreLocalisation = new GeographicFilter(code_postal, code_commune);

    return new AideFilter({
      ...filtreLocalisation,
      ...aide,
      thematiques:
        aide.thematiques && aide.thematiques.length > 0
          ? aide.thematiques
          : undefined,
    });
  }

  public static buildSearchQueryClauses(filter: AideFilter): any {
    const clauses = GeographicFilter.getSearchClauses(filter);

    if (filter.besoins) {
      clauses.push({
        besoin: { in: filter.besoins },
      });
    }

    if (filter.thematiques) {
      clauses.push({
        thematiques: {
          hasSome: filter.thematiques,
        },
      });
    }

    if (filter.date_expiration) {
      clauses.push({
        OR: [
          { date_expiration: null },
          {
            date_expiration: {
              gt: filter.date_expiration,
            },
          },
        ],
      });
    }

    return clauses;
  }
}
