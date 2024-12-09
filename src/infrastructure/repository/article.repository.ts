import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Article } from '../../domain/contenu/article';
import { Article as ArticleDB } from '@prisma/client';
import { Thematique } from '../../domain/contenu/thematique';
import { DifficultyLevel } from '../../domain/contenu/difficultyLevel';
import { TagUtilisateur } from '../../../src/domain/scoring/tagUtilisateur';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { ArticleDefinition } from '../../domain/contenu/articleDefinition';

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
  tag_article?: string;
};

@Injectable()
export class ArticleRepository {
  constructor(private prisma: PrismaService) {}

  async upsert(article: ArticleDefinition): Promise<void> {
    const article_to_save: ArticleDB = {
      source: article.source,
      soustitre: article.soustitre,
      tag_article: article.tag_article,
      tags_utilisateur: article.tags_utilisateur,
      thematique_principale: article.thematique_principale,
      thematiques: article.thematiques,
      contenu: article.contenu,
      categorie: article.categorie,
      codes_departement: article.codes_departement,
      codes_postaux: article.codes_postaux,
      codes_region: article.codes_region,
      content_id: article.content_id,
      difficulty: article.difficulty,
      duree: article.duree,
      frequence: article.frequence,
      titre: article.titre,
      exclude_codes_commune: article.exclude_codes_commune,
      image_url: article.image_url,
      include_codes_commune: article.include_codes_commune,
      partenaire: article.partenaire,
      partenaire_url: article.partenaire_url,
      partenaire_logo_url: article.partenaire_logo_url,
      mois: article.mois,
      points: article.points,
      rubrique_ids: article.rubrique_ids,
      rubrique_labels: article.rubrique_labels,
      sources: article.sources as any,
      created_at: undefined,
      updated_at: undefined,
    };

    await this.prisma.article.upsert({
      where: { content_id: article.content_id },
      create: article_to_save,
      update: article_to_save,
    });
  }
  async delete(content_id: string): Promise<void> {
    await this.prisma.article.delete({
      where: { content_id: content_id },
    });
  }

  async getArticleDefinitionByContentId(
    content_id: string,
  ): Promise<ArticleDefinition> {
    const result = await this.prisma.article.findUnique({
      where: { content_id: content_id },
    });
    return this.buildArticleFromDB(result);
  }

  async searchArticles(filter: ArticleFilter): Promise<ArticleDefinition[]> {
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

    if (filter.tag_article) {
      main_filter.push({
        tag_article: filter.tag_article,
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

  private buildArticleFromDB(articleDB: ArticleDB): ArticleDefinition {
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
      mois: articleDB.mois,
      codes_departement: articleDB.codes_departement,
      codes_region: articleDB.codes_region,
      exclude_codes_commune: articleDB.exclude_codes_commune,
      include_codes_commune: articleDB.include_codes_commune,
      tag_article: articleDB.tag_article,
      contenu: articleDB.contenu,
      sources: articleDB.sources as any,
      partenaire_logo_url: articleDB.partenaire_logo_url,
      partenaire_url: articleDB.partenaire_url,
    });
  }
}
