import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Quizz } from '../../../src/domain/quizz/quizz';
import { Quizz as QuizzDB } from '@prisma/client';
import { DifficultyLevel } from '../../domain/contenu/difficultyLevel';
import { Thematique } from '../../domain/contenu/thematique';
import { ContentRecommandation } from '../../domain/contenu/contentRecommandation';

export type QuizzFilter = {
  maxNumber?: number;
  thematiques?: Thematique[];
  code_postal?: string;
  difficulty?: DifficultyLevel;
  exclude_ids?: string[];
  asc_difficulty?: boolean;
};

@Injectable()
export class QuizzRepository {
  constructor(private prisma: PrismaService) {}

  async upsert(quizz: Quizz): Promise<void> {
    await this.prisma.quizz.upsert({
      where: { content_id: quizz.content_id },
      create: {
        ...quizz,
        created_at: undefined,
        updated_at: undefined,
      },
      update: {
        ...quizz,
        updated_at: undefined,
      },
    });
  }
  async delete(content_id: string): Promise<void> {
    await this.prisma.quizz.delete({
      where: { content_id: content_id },
    });
  }

  async getQuizzByContentId(content_id: string): Promise<Quizz> {
    const result = await this.prisma.quizz.findUnique({
      where: { content_id: content_id },
    });
    return this.buildQuizzFromDB(result);
  }

  async searchQuizzes(filter: QuizzFilter): Promise<Quizz[]> {
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

    const result = await this.prisma.quizz.findMany(finalQuery);
    return result.map((elem) => this.buildQuizzFromDB(elem));
  }

  public async getQuizzRecommandations(
    version: number,
    utilisateurId: string,
  ): Promise<ContentRecommandation> {
    const result = new ContentRecommandation();
    const query = `
    SELECT
      coalesce(SUM(CAST(poids_rubrique->rubrique_quizz as INTEGER)),0)
      +
      coalesce(SUM(CAST(ponderation_tags->tags as INTEGER)),0)
      as score, content_id, difficulty
    FROM
      (
        SELECT
          "Utilisateur".ponderation_tags AS ponderation_tags,
          "Ponderation".rubriques AS poids_rubrique,
          unnest("Quizz".rubrique_ids) as rubrique_quizz,
          unnest("Quizz".tags) as tags,
          "Quizz".content_id as content_id,
          "Quizz".difficulty as difficulty
        FROM
          "Ponderation",
          "Quizz",
          "Utilisateur"
        WHERE
          "Ponderation".version = ${version} AND
          "Utilisateur".id = '${utilisateurId}'
      ) as SUBQUERY
    GROUP BY
      content_id, difficulty
    ORDER BY
      difficulty ASC,
      score DESC
    ;
    `;
    const recos: { score: BigInt; content_id: string }[] =
      await this.prisma.$queryRawUnsafe(query);
    recos.forEach((element) => {
      result.append(Number(element.score), element.content_id);
    });
    return result;
  }

  private buildQuizzFromDB(quizzDB: QuizzDB): Quizz {
    if (quizzDB === null) return null;
    return {
      content_id: quizzDB.content_id,
      titre: quizzDB.titre,
      soustitre: quizzDB.soustitre,
      source: quizzDB.source,
      image_url: quizzDB.image_url,
      partenaire: quizzDB.partenaire,
      rubrique_ids: quizzDB.rubrique_ids,
      rubrique_labels: quizzDB.rubrique_labels,
      codes_postaux: quizzDB.codes_postaux,
      duree: quizzDB.duree,
      frequence: quizzDB.frequence,
      difficulty: quizzDB.difficulty,
      points: quizzDB.points,
      thematique_principale: Thematique[quizzDB.thematique_principale],
      thematiques: quizzDB.thematiques.map((th) => Thematique[th]),
      tags: quizzDB.tags,
    };
  }
}
