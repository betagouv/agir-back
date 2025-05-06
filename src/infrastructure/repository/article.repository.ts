import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Article as ArticleDB } from '@prisma/client';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { TagUtilisateur } from '../../../src/domain/scoring/tagUtilisateur';
import { Echelle } from '../../domain/aides/echelle';
import { Article } from '../../domain/contenu/article';
import { ArticleDefinition } from '../../domain/contenu/articleDefinition';
import { DifficultyLevel } from '../../domain/contenu/difficultyLevel';
import { Thematique } from '../../domain/thematique/thematique';
import { PrismaService } from '../prisma/prisma.service';

export type ArticleFilter = {
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
  skip?: number;
  take?: number;
};

@Injectable()
export class ArticleRepository {
  private static catalogue_articles: Map<string, ArticleDefinition>;

  constructor(private prisma: PrismaService) {
    ArticleRepository.catalogue_articles = new Map();
  }

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.loadCache();
    } catch (error) {
      console.error(
        `Error loading article definitions at startup, they will be available in less than a minute by cache refresh mecanism`,
      );
      console.error(error);
    }
  }

  @Cron('* * * * *')
  public async loadCache() {
    const new_map: Map<string, ArticleDefinition> = new Map();
    const liste_articles = await this.prisma.article.findMany();
    for (const article of liste_articles) {
      new_map.set(article.content_id, this.buildArticleFromDB(article));
    }
    ArticleRepository.catalogue_articles = new_map;
  }

  public static resetCache() {
    // FOR TEST ONLY
    ArticleRepository.catalogue_articles = new Map();
  }

  public getArticle(cms_id: string): ArticleDefinition {
    return ArticleRepository.catalogue_articles.get(cms_id);
  }

  async upsert(article_def: ArticleDefinition): Promise<void> {
    const article_to_save: ArticleDB = {
      source: article_def.source,
      soustitre: article_def.soustitre,
      tag_article: article_def.tag_article,
      partenaire_id: article_def.partenaire_id,
      tags_utilisateur: article_def.tags_utilisateur,
      thematique_principale: article_def.thematique_principale,
      thematiques: article_def.thematiques,
      contenu: article_def.contenu,
      categorie: article_def.categorie,
      codes_departement: article_def.codes_departement,
      codes_postaux: article_def.codes_postaux,
      codes_region: article_def.codes_region,
      content_id: article_def.content_id,
      difficulty: article_def.difficulty,
      duree: article_def.duree,
      frequence: article_def.frequence,
      titre: article_def.titre,
      exclude_codes_commune: article_def.exclude_codes_commune,
      image_url: article_def.image_url,
      include_codes_commune: article_def.include_codes_commune,
      mois: article_def.mois,
      points: article_def.points,
      rubrique_ids: article_def.rubrique_ids,
      rubrique_labels: article_def.rubrique_labels,
      sources: article_def.sources as any,
      derniere_maj: article_def.derniere_maj,
      echelle: article_def.echelle,
      tags_a_exclure_v2: article_def.tags_a_exclure,
      tags_a_inclure_v2: article_def.tags_a_inclure,
      created_at: undefined,
      updated_at: undefined,
    };

    await this.prisma.article.upsert({
      where: { content_id: article_def.content_id },
      create: article_to_save,
      update: article_to_save,
    });
  }
  async delete(content_id: string): Promise<void> {
    await this.prisma.article.delete({
      where: { content_id: content_id },
    });
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
      skip: filter.skip,
      take: filter.take,
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
      partenaire_id: articleDB.partenaire_id,
      content_id: articleDB.content_id,
      categorie: Categorie[articleDB.categorie],
      titre: articleDB.titre,
      soustitre: articleDB.soustitre,
      source: articleDB.source,
      image_url: articleDB.image_url,
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
      derniere_maj: articleDB.derniere_maj,
      echelle: Echelle[articleDB.echelle],
      tags_a_exclure: articleDB.tags_a_exclure_v2,
      tags_a_inclure: articleDB.tags_a_inclure_v2,
    });
  }
}
