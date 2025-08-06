import { GeographicFilter } from '../filtre/geographicFilter';
import { Thematique } from '../thematique/thematique';
import { Categorie } from './categorie';
import { DifficultyLevel } from './difficultyLevel';

export class ArticleFilter extends GeographicFilter {
  thematiques?: Thematique[];
  difficulty?: DifficultyLevel;
  exclude_ids?: string[];
  include_ids?: string[];
  asc_difficulty?: boolean;
  titre_fragment?: string;
  categorie?: Categorie;
  date?: Date;
  skip?: number;
  take?: number;

  constructor(filter?: ArticleFilter) {
    super();
    Object.assign(this, filter);
  }

  public static create(
    code_postal: string,
    code_commune: string,
    article: ArticleFilter,
  ): ArticleFilter {
    const filterLocalisation = GeographicFilter.build(
      code_postal,
      code_commune,
    );

    return new ArticleFilter({
      date: new Date(),
      ...filterLocalisation,
      ...article,
    });
  }

  public static buildSearchQueryClauses(filter: ArticleFilter): any[] {
    const filter_clauses = GeographicFilter.buildSearchQueryClauses(filter);

    if (filter.date) {
      filter_clauses.push({
        OR: [
          { mois: { has: filter.date.getMonth() + 1 } },
          { mois: { isEmpty: true } },
        ],
      });
    }

    if (filter.difficulty !== undefined && filter.difficulty !== null) {
      filter_clauses.push({
        difficulty:
          filter.difficulty === DifficultyLevel.ANY
            ? undefined
            : filter.difficulty,
      });
    }

    if (filter.exclude_ids) {
      filter_clauses.push({
        content_id: { not: { in: filter.exclude_ids } },
      });
    }

    if (filter.include_ids) {
      filter_clauses.push({
        content_id: { in: filter.include_ids },
      });
    }

    if (filter.titre_fragment) {
      filter_clauses.push({
        titre: {
          contains: filter.titre_fragment,
          mode: 'insensitive',
        },
      });
    }

    if (filter.categorie) {
      filter_clauses.push({
        categorie: filter.categorie,
      });
    }

    if (filter.thematiques) {
      filter_clauses.push({
        thematiques: {
          hasSome: filter.thematiques,
        },
      });
    }

    return filter_clauses;
  }
}
