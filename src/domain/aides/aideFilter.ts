import { FilterLocalisation } from '../filtre/filterLocalisation';
import { Thematique } from '../thematique/thematique';

export class AideFilter extends FilterLocalisation {
  maxNumber?: number;
  thematiques?: Thematique[];
  besoins?: string[];
  date_expiration?: Date;

  constructor(filter?: AideFilter) {
    super();
    Object.assign(this, filter);
  }

  public static create(
    code_postal: string,
    code_commune: string,
    aide: AideFilter,
  ) {
    const filtreLocalisation = FilterLocalisation.build(
      code_postal,
      code_commune,
    );

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
    const clauses = FilterLocalisation.buildSearchQueryClauses(filter);

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
