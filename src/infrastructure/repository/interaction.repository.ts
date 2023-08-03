import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Interaction as DBInteraction } from '@prisma/client';
import { Interaction } from '../../../src/domain/interaction';

@Injectable()
export class InteractionRepository {
  constructor(private prisma: PrismaService) {}

  async getInteractionById(interactionId): Promise<Interaction | null> {
    const result = await this.prisma.interaction.findUnique({
      where: { id: interactionId },
    });
    return result ? new Interaction(result) : null;
  }

  async listInteractionsByUtilisateurId(
    utilisateurId: string,
  ): Promise<DBInteraction[] | null> {
    return this.prisma.interaction.findMany({
      where: {
        utilisateurId,
        done: false,
        succeeded: false,
      },
      orderBy: [
        {
          reco_score: 'asc',
        },
      ],
    });
  }
  async partialUpdateInteraction(
    interaction: Interaction,
  ): Promise<DBInteraction | null> {
    return this.prisma.interaction.update({
      where: {
        id: interaction.id,
      },
      data: {
        ...interaction,
        updated_at: undefined,
      },
    });
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
        succeeded: false,
        clicked_at: null,
        done_at: null,
        succeeded_at: null,
        scheduled_reset: null,
      },
    });
    return result.count;
  }
}
