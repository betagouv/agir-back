import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Interaction as DBInteraction } from '@prisma/client';
import { Interaction } from '../../domain/interaction/interaction';
import { v4 as uuidv4 } from 'uuid';
import { SearchFilter } from '../../../src/domain/interaction/searchFilter';

@Injectable()
export class InteractionRepository {
  constructor(private prisma: PrismaService) {}

  async getInteractionById(interactionId): Promise<Interaction | null> {
    const result = await this.prisma.interaction.findUnique({
      where: { id: interactionId },
    });
    return result ? new Interaction(result) : null;
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

  async listMaxEligibleInteractionsByUtilisateurIdAndType(
    filter: SearchFilter,
  ): Promise<Interaction[] | null> {
    return this.prisma.interaction.findMany({
      take: filter.maxNumber,
      where: {
        utilisateurId: filter.utilisateurId,
        done: false,
        succeeded: false,
        type: filter.type,
        pinned_at_position: filter.pinned ? { not: null } : null,
        locked: filter.locked,
      },
      orderBy: [
        {
          reco_score: 'asc',
        },
      ],
    }) as Promise<Interaction[] | null>;
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
        updated_at: undefined, // pour forcer la mise à jour auto
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
