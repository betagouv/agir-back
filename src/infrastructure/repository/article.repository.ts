import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Article } from '../../../src/domain/article';
import { Thematique } from '../../../src/domain/thematique';
import { DifficultyLevel } from '../../../src/domain/difficultyLevel';

export type ArticleFilter = {
  maxNumber?: number;
  thematiques?: Thematique[];
  code_postal?: string;
  difficulty?: DifficultyLevel;
  exclude_ids?: string[];
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
    return this.prisma.article.findUnique({
      where: { content_id: content_id },
    });
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

    return this.prisma.article.findMany(finalQuery);
  }
}
