import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Article } from '../../../src/domain/article';
import { Article as ArticleDB } from '@prisma/client';
import { Thematique } from '../../../src/domain/thematique';
import { DifficultyLevel } from '../../../src/domain/difficultyLevel';
import { ContentRecommandation } from '../../domain/contentRecommandation';

export type ArticleFilter = {
  maxNumber?: number;
  thematiques?: Thematique[];
  code_postal?: string;
  difficulty?: DifficultyLevel;
  exclude_ids?: string[];
  asc_difficulty?: boolean;
};

@Injectable()
export class ArticleRepository {
  constructor(private prisma: PrismaService) {}

  async upsert(article: Article): Promise<void> {
    await this.prisma.article.upsert({
      where: { content_id: article.content_id },
      create: {
        ...article,
        created_at: undefined,
        updated_at: undefined,
      },
      update: {
        ...article,
        updated_at: undefined,
      },
    });
  }

  async getArticleByContentId(content_id: string): Promise<Article> {
    const result = await this.prisma.article.findUnique({
      where: { content_id: content_id },
    });
    return this.buildArticleFromDB(result);
  }

  async searchArticles(filter: ArticleFilter): Promise<Article[]> {
    let codes_postaux_filter;

    if (filter.code_postal) {
      codes_postaux_filter = [
        { codes_postaux: { has: filter.code_postal } },
        { codes_postaux: { isEmpty: true } },
      ];
    }

    const main_filter = {};

    if (filter.difficulty !== undefined && filter.difficulty !== null) {
      main_filter['difficulty'] =
        filter.difficulty === DifficultyLevel.ANY
          ? undefined
          : filter.difficulty;
    }

    if (filter.exclude_ids) {
      main_filter['content_id'] = { not: { in: filter.exclude_ids } };
    }

    if (filter.thematiques) {
      main_filter['thematiques'] = {
        hasSome: filter.thematiques,
      };
    }

    const finalQuery = {
      take: filter.maxNumber,
      where: {
        OR: codes_postaux_filter,
        AND: main_filter,
      },
    };

    if (filter.asc_difficulty) {
      finalQuery['orderBy'] = [{ difficulty: 'asc' }];
    }

    const result = await this.prisma.article.findMany(finalQuery);
    return result.map((elem) => this.buildArticleFromDB(elem));
  }

  public async getArticleRecommandations(
    version: number,
  ): Promise<ContentRecommandation> {
    const result = new ContentRecommandation();
    const query = `
    SELECT
      coalesce(SUM(CAST(poids_rubrique->rubrique_article as INTEGER)),0) as score, content_id
    FROM
      (
        SELECT
          "Ponderation".rubriques AS poids_rubrique,
          unnest("Article".rubrique_ids) as rubrique_article,
          "Article".content_id as content_id
        FROM
          "Ponderation",
          "Article"
        WHERE
          "Ponderation".version = ${version}
      ) as SUBQUERY
    GROUP BY
      content_id
    ORDER BY
      score desc
    ;
    `;
    const recos: { score: BigInt; content_id: string }[] =
      await this.prisma.$queryRawUnsafe(query);
    recos.forEach((element) => {
      result.append(Number(element.score), element.content_id);
    });
    return result;
  }

  private buildArticleFromDB(articleDB: ArticleDB): Article {
    if (articleDB === null) return null;
    return {
      content_id: articleDB.content_id,
      titre: articleDB.titre,
      soustitre: articleDB.soustitre,
      source: articleDB.source,
      image_url: articleDB.image_url,
      partenaire: articleDB.partenaire,
      rubrique_ids: articleDB.rubrique_ids,
      rubrique_labels: articleDB.rubrique_labels,
      codes_postaux: articleDB.codes_postaux,
      duree: articleDB.duree,
      frequence: articleDB.frequence,
      difficulty: articleDB.difficulty,
      points: articleDB.points,
      thematique_gamification: Thematique[articleDB.thematique_gamification],
      thematiques: articleDB.thematiques.map((th) => Thematique[th]),
    };
  }
}
