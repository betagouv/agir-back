import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Interaction,
  InteractionIdProjection,
} from '../../domain/interaction/interaction';
import { Interaction as InteractionDB } from '@prisma/client';

import { v4 as uuidv4 } from 'uuid';
import { SearchFilter } from '../../../src/domain/interaction/searchFilter';
import { InteractionType } from '../../../src/domain/interaction/interactionType';
import { Thematique } from '../../domain/thematique';
import { InteractionScore } from '../../../src/domain/interaction/interactionScore';
import { DifficultyLevel } from '../../../src/domain/difficultyLevel';
import { InteractionDefinition } from '../../../src/domain/interaction/interactionDefinition';
import { UserQuizzProfile } from '../../../src/domain/quizz/userQuizzProfile';

@Injectable()
export class InteractionRepository {
  constructor(private prisma: PrismaService) {}

  async delete(utilisateurId: string) {
    if (utilisateurId)
      await this.prisma.interaction.deleteMany({ where: { utilisateurId } });
  }

  async getInteractionById(interactionId): Promise<Interaction | null> {
    const result = await this.prisma.interaction.findUnique({
      where: { id: interactionId },
    });
    return result ? this.buildInteractionFromInteractionDB(result) : null;
  }

  async insertInteractionForUtilisateur(
    utilisateurId: string,
    interaction: Interaction,
  ) {
    return this.prisma.interaction.create({
      data: {
        ...interaction,
        id: uuidv4(),
        utilisateurId,
      },
    });
  }

  async listDoneQuizzByCategorieAndDifficulty(
    utilisateurId: string,
    thematique_gamification: Thematique,
    difficulty: DifficultyLevel,
  ): Promise<Interaction[]> {
    const liste = await this.prisma.interaction.findMany({
      where: {
        utilisateurId,
        thematique_gamification,
        done: true,
        difficulty,
        type: InteractionType.quizz,
      },
      orderBy: [
        {
          done_at: 'desc',
        },
      ],
    });
    return liste.map((interactionDB) =>
      this.buildInteractionFromInteractionDB(interactionDB),
    );
  }

  async listInteractionsByFilter(filter: SearchFilter): Promise<Interaction[]> {
    const query = this.buildInteractionComplexFilterQuery(filter, false);

    const interList = await this.prisma.interaction.findMany(query);

    return interList.map((interactionDB) =>
      this.buildInteractionFromInteractionDB(interactionDB),
    );
  }
  async listInteractionIdProjectionByFilter(
    filter: SearchFilter,
  ): Promise<InteractionIdProjection[]> {
    const query = this.buildInteractionComplexFilterQuery(filter, true);

    return this.prisma.interaction.findMany(query);
  }

  async listInteractionScores(
    utilisateurId: string,
    thematiques_gamification: Thematique[],
  ): Promise<InteractionScore[] | null> {
    const result = await this.prisma.interaction.findMany({
      where: {
        utilisateurId,
        thematique_gamification: {
          in: thematiques_gamification,
        },
      },
      select: {
        score: true,
        id: true,
      },
    });
    return result.map(
      (inter) => new InteractionScore(inter['id'], inter['score']),
    );
  }

  async updateInteractionScores(interactionScores: InteractionScore[]) {
    return await this.prisma.$transaction(
      interactionScores.map((inter) => {
        return this.prisma.interaction.updateMany({
          where: {
            id: inter.id,
          },
          data: {
            score: inter.score,
          },
        });
      }),
    );
  }

  async updateInteraction(interaction: Interaction) {
    await this.prisma.interaction.update({
      where: {
        id: interaction.id,
      },
      data: {
        ...interaction,
        updated_at: undefined, // pour forcer la mise à jour auto
      },
    });
  }

  async updateInteractionFromDefinitionByContentId(
    interactionDefinition: InteractionDefinition,
  ) {
    // FIXME : refacto code autour des valeurs à pas toucher
    await this.prisma.interaction.updateMany({
      where: {
        content_id: interactionDefinition.content_id,
      },
      data: {
        ...interactionDefinition,
        updated_at: undefined, // pour forcer la mise à jour auto
        id: undefined,
      },
    });
  }
  async doesContentIdExists(content_id: string): Promise<boolean> {
    const count = await this.prisma.interaction.count({
      where: {
        content_id,
      },
    });
    return count > 0;
  }

  async insertInteractionList(interactionList: Interaction[]) {
    return this.prisma.interaction.createMany({ data: interactionList });
  }

  async resetAllInteractionStatus(date: Date) {
    const result = await this.prisma.interaction.updateMany({
      where: {
        scheduled_reset: {
          lt: date,
        },
      },
      data: {
        clicked: false,
        done: false,
        clicked_at: null,
        done_at: null,
        scheduled_reset: null,
      },
    });
    return result.count;
  }

  async deleteByContentIdWhenNotDone(content_id: string) {
    await this.prisma.interaction.deleteMany({
      where: {
        content_id,
        done: false,
      },
    });
  }

  private buildQuizzGlobalSQLFilter(quizzProfile: UserQuizzProfile): any[] {
    let result = [];
    for (const cat in Thematique) {
      if (quizzProfile.getLevel(cat as Thematique)) {
        result.push({
          type: InteractionType.quizz,
          thematique_gamification: cat,
          difficulty: quizzProfile.getLevel(cat as Thematique),
        });
      }
    }
    return result;
  }

  private buildInteractionFromInteractionDB(
    interDB: InteractionDB,
  ): Interaction {
    return new Interaction({
      ...interDB,
      type: InteractionType[interDB.type],
      thematique_gamification: Thematique[interDB.thematique_gamification],
      thematiques: interDB.thematiques.map((th) => Thematique[th]),
      score: interDB.score.toNumber(),
    });
  }

  private buildInteractionComplexFilterQuery(
    filter: SearchFilter,
    project: boolean,
  ): object {
    let quizz_difficulty_filter;
    if (filter.type === InteractionType.quizz && filter.quizzProfile) {
      quizz_difficulty_filter = this.buildQuizzGlobalSQLFilter(
        filter.quizzProfile,
      );
    }
    let codes_postaux_filter;

    if (filter.code_postal) {
      codes_postaux_filter = [
        { codes_postaux: { has: filter.code_postal } },
        { codes_postaux: { isEmpty: true } },
      ];
    }
    let main_filter = {
      utilisateurId: filter.utilisateurId,
      done: filter.done,
      quizz_score: filter.quizz_full_success ? 100 : undefined,
      type: filter.type,
      pinned_at_position: filter.pinned ? { not: null } : null,
      locked: filter.locked,
      difficulty:
        filter.difficulty == DifficultyLevel.ANY
          ? undefined
          : filter.difficulty,
      OR: quizz_difficulty_filter,
    };
    if (filter.thematiques) {
      main_filter['thematiques'] = {
        hasSome: filter.thematiques,
      };
    }
    if (filter.thematique_gamification) {
      main_filter['thematique_gamification'] = {
        in: filter.thematique_gamification,
      };
    }
    let finalQuery = {
      take: filter.maxNumber,
      where: {
        OR: codes_postaux_filter,
        AND: main_filter,
      },
      orderBy: [
        {
          score: 'desc',
        },
      ],
    };
    if (project) {
      finalQuery['select'] = {
        id: true,
        content_id: true,
      };
    }
    return finalQuery;
  }
}
