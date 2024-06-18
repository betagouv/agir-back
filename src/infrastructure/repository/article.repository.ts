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
  date?: Date;
  code_region?: string;
  code_departement?: string;
  code_commune?: string;
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
    let mois_filter;

    const main_filter = [];

    if (filter.date) {
      main_filter.push({
        OR: [
          { mois: { has: filter.date.getMonth() + 1 } },
          { mois: { isEmpty: true } },
        ],
      });
    }

    if (filter.code_postal) {
      main_filter.push({
        OR: [
          { codes_postaux: { has: filter.code_postal } },
          { codes_postaux: { isEmpty: true } },
        ],
      });
    }

    if (filter.code_region) {
      main_filter.push({
        OR: [
          { codes_region: { has: filter.code_region } },
          { codes_region: { isEmpty: true } },
        ],
      });
    }

    if (filter.code_departement) {
      main_filter.push({
        OR: [
          { codes_departement: { has: filter.code_departement } },
          { codes_departement: { isEmpty: true } },
        ],
      });
    }

    if (filter.code_commune) {
      main_filter.push({
        OR: [
          { include_codes_commune: { has: filter.code_commune } },
          { include_codes_commune: { isEmpty: true } },
        ],
      });
      main_filter.push({
        OR: [
          { NOT: { exclude_codes_commune: { has: filter.code_commune } } },
          { exclude_codes_commune: { isEmpty: true } },
        ],
      });
    }

    if (filter.difficulty !== undefined && filter.difficulty !== null) {
      main_filter.push({
        difficulty:
          filter.difficulty === DifficultyLevel.ANY
            ? undefined
            : filter.difficulty,
      });
    }

    if (filter.exclude_ids) {
      main_filter.push({
        content_id: { not: { in: filter.exclude_ids } },
      });
    }

    if (filter.include_ids) {
      main_filter.push({
        content_id: { in: filter.include_ids },
      });
    }

    if (filter.titre_fragment) {
      main_filter.push({
        titre: {
          contains: filter.titre_fragment,
          mode: 'insensitive',
        },
      });
    }

    if (filter.categorie) {
      main_filter.push({
        categorie: filter.categorie,
      });
    }

    if (filter.thematiques) {
      main_filter.push({
        thematiques: {
          hasSome: filter.thematiques,
        },
      });
    }

    const finalQuery = {
      take: filter.maxNumber,
      where: {
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
      codes_departement: articleDB.codes_departement,
      codes_region: articleDB.codes_region,
      exclude_codes_commune: articleDB.exclude_codes_commune,
      include_codes_commune: articleDB.include_codes_commune,
    });
  }
}
