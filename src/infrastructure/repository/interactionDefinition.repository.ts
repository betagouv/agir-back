import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InteractionDefinition } from '../../../src/domain/interaction/interactionDefinition';
import { InteractionType } from '../../../src/domain/interaction/interactionType';
import {
  InteractionDefinition as InteractionDefinitionDB,
  Prisma,
} from '@prisma/client';
import { Thematique } from '../../../src/domain/thematique';

@Injectable()
export class InteractionDefinitionRepository {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<InteractionDefinition[] | null> {
    let result = await this.prisma.interactionDefinition.findMany({});
    return result.map((inter) => this.buildInteractionDefinitionFromDB(inter));
  }
  async createOrUpdateBasedOnId(interaction: InteractionDefinition) {
    await this.prisma.interactionDefinition.upsert({
      where: {
        id: interaction.id,
      },
      create: interaction,
      update: interaction,
    });
  }
  async createOrUpdateBasedOnContentIdAndType(
    interaction: InteractionDefinition,
  ) {
    await this.prisma.interactionDefinition.upsert({
      where: {
        type_content_id: {
          content_id: interaction.content_id,
          type: interaction.type,
        },
      },
      create: interaction,
      update: interaction,
    });
  }
  async getByTypeAndContentId(
    type: InteractionType,
    content_id: string,
  ): Promise<InteractionDefinition | null> {
    const result = await this.prisma.interactionDefinition.findUnique({
      where: {
        type_content_id: {
          content_id,
          type: type.toString(),
        },
      },
    });
    return result ? this.buildInteractionDefinitionFromDB(result) : null;
  }

  async deleteByContentIdAndType(type: InteractionType, content_id: string) {
    try {
      await this.prisma.interactionDefinition.delete({
        where: {
          type_content_id: {
            content_id,
            type: type.toString(),
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        // NOTHING TO DO ^^
      } else {
        throw error;
      }
    }
  }

  private buildInteractionDefinitionFromDB(
    interDefDB: InteractionDefinitionDB,
  ): InteractionDefinition {
    return new InteractionDefinition({
      ...interDefDB,
      type: InteractionType[interDefDB.type],
      thematique_gamification: Thematique[interDefDB.thematique_gamification],
      thematiques: interDefDB.thematiques.map((th) => Thematique[th]),
    });
  }
}
