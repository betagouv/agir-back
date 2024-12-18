import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Quizz as QuizzDB } from '@prisma/client';
import { DifficultyLevel } from '../../domain/contenu/difficultyLevel';
import { Thematique } from '../../domain/contenu/thematique';
import { TagUtilisateur } from '../../../src/domain/scoring/tagUtilisateur';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { QuizzDefinition } from '../../domain/contenu/quizzDefinition';

export type QuizzFilter = {
  maxNumber?: number;
  thematiques?: Thematique[];
  code_postal?: string;
  difficulty?: DifficultyLevel;
  exclude_ids?: string[];
  asc_difficulty?: boolean;
  categorie?: Categorie;
  date?: Date;
};

@Injectable()
export class QuizzRepository {
  constructor(private prisma: PrismaService) {}

  async upsert(quizz: QuizzDefinition): Promise<void> {
    const quizz_to_save: QuizzDB = {
      categorie: quizz.categorie,
      article_id: quizz.article_id,
      questions: quizz.questions,
      codes_postaux: quizz.codes_postaux,
      content_id: quizz.content_id,
      difficulty: quizz.difficulty,
      duree: quizz.duree,
      frequence: quizz.frequence,
      image_url: quizz.image_url,
      mois: quizz.mois,
      partenaire_id: quizz.partenaire_id,
      points: quizz.points,
      rubrique_ids: quizz.rubrique_ids,
      rubrique_labels: quizz.rubrique_labels,
      source: quizz.source,
      soustitre: quizz.soustitre,
      titre: quizz.titre,
      tags_utilisateur: quizz.tags_utilisateur,
      thematique_principale: quizz.thematique_principale,
      thematiques: quizz.thematiques,
      created_at: undefined,
      updated_at: undefined,
    };
    await this.prisma.quizz.upsert({
      where: { content_id: quizz.content_id },
      create: quizz_to_save,
      update: quizz_to_save,
    });
  }

  async delete(content_id: string): Promise<void> {
    await this.prisma.quizz.delete({
      where: { content_id: content_id },
    });
  }

  async getQuizzDefinitionByContentId(
    content_id: string,
  ): Promise<QuizzDefinition> {
    const result = await this.prisma.quizz.findUnique({
      where: { content_id: content_id },
    });
    return this.buildQuizzFromDB(result);
  }

  async searchQuizzes(filter: QuizzFilter): Promise<QuizzDefinition[]> {
    let codes_postaux_filter;
    let mois_filter;

    if (filter.code_postal) {
      codes_postaux_filter = [
        { codes_postaux: { has: filter.code_postal } },
        { codes_postaux: { isEmpty: true } },
      ];
    }
    if (filter.date) {
      mois_filter = [
        { mois: { has: filter.date.getMonth() + 1 } },
        { mois: { isEmpty: true } },
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
        AND: [main_filter, { OR: mois_filter }, { OR: codes_postaux_filter }],
      },
    };

    if (filter.asc_difficulty) {
      finalQuery['orderBy'] = [{ difficulty: 'asc' }];
    }

    const result = await this.prisma.quizz.findMany(finalQuery);
    return result.map((elem) => this.buildQuizzFromDB(elem));
  }

  private buildQuizzFromDB(quizzDB: QuizzDB): QuizzDefinition {
    if (quizzDB === null) return null;
    return {
      content_id: quizzDB.content_id,
      titre: quizzDB.titre,
      soustitre: quizzDB.soustitre,
      source: quizzDB.source,
      image_url: quizzDB.image_url,
      partenaire_id: quizzDB.partenaire_id,
      rubrique_ids: quizzDB.rubrique_ids,
      rubrique_labels: quizzDB.rubrique_labels,
      codes_postaux: quizzDB.codes_postaux,
      duree: quizzDB.duree,
      frequence: quizzDB.frequence,
      difficulty: quizzDB.difficulty,
      points: quizzDB.points,
      thematique_principale: Thematique[quizzDB.thematique_principale],
      thematiques: quizzDB.thematiques.map((th) => Thematique[th]),
      tags_utilisateur: quizzDB.tags_utilisateur.map((t) => TagUtilisateur[t]),
      categorie: Categorie[quizzDB.categorie],
      mois: quizzDB.mois,
      article_id: quizzDB.article_id,
      questions: quizzDB.questions as any,
    };
  }
}
