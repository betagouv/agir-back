import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Article, ArticleData } from '../../domain/contenu/article';
import { Article as ArticleDB } from '@prisma/client';
import { Thematique } from '../../domain/contenu/thematique';
import { DifficultyLevel } from '../../domain/contenu/difficultyLevel';
import { TagUtilisateur } from '../../../src/domain/scoring/tagUtilisateur';
import { Categorie } from '../../../src/domain/contenu/categorie';

export type ArticleFilter = {
  maxNumber?: number;
  thematiques?: Thematique[];
  code_postal?: string;
  difficulty?: DifficultyLevel;
  exclude_ids?: string[];
  include_ids?: string[];
  asc_difficulty?: boolean;
  titre_fragment?: string;
  categorie?: Categorie;
};

@Injectable()
export class ArticleRepository {
  constructor(private prisma: PrismaService) {}

  async upsert(article: ArticleData): Promise<void> {
    const article_to_save = { ...article };
    delete article_to_save.score;
    delete article_to_save.tags_rubriques;
    await this.prisma.article.upsert({
      where: { content_id: article.content_id },
      create: {
        ...article_to_save,
        created_at: undefined,
        updated_at: undefined,
      },
      update: {
        ...article_to_save,
        updated_at: undefined,
      },
    });
  }
  async delete(content_id: string): Promise<void> {
    await this.prisma.article.delete({
      where: { content_id: content_id },
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
    if (filter.include_ids) {
      main_filter['content_id'] = { in: filter.include_ids };
    }

    if (filter.titre_fragment) {
      main_filter['titre'] = {
        contains: filter.titre_fragment,
        mode: 'insensitive',
      };
    }

    if (filter.categorie) {
      main_filter['categorie'] = filter.categorie;
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

  private buildArticleFromDB(articleDB: ArticleDB): Article {
    if (articleDB === null) return null;
    return new Article({
      content_id: articleDB.content_id,
      categorie: Categorie[articleDB.categorie],
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
      thematique_principale: Thematique[articleDB.thematique_principale],
      thematiques: articleDB.thematiques.map((th) => Thematique[th]),
      tags_utilisateur: articleDB.tags_utilisateur.map(
        (t) => TagUtilisateur[t],
      ),
      tags_rubriques: [],
      score: 0,
      mois: articleDB.mois,
    });
  }
}
