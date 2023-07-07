import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Interaction } from '@prisma/client';
import { InteractionStatus } from '../../../src/domain/interactionStatus';

@Injectable()
export class InteractionRepository {
  constructor(private prisma: PrismaService) {}

  async getInteractionById(interactionId): Promise<Interaction | null> {
    return this.prisma.interaction.findUnique({
      where: { id: interactionId },
    });
  }

  async listInteractionsByUtilisateurId(
    utilisateurId: string,
  ): Promise<Interaction[] | null> {
    return this.prisma.interaction.findMany({
      where: { utilisateurId },
      orderBy: [
        {
          reco_score: 'asc',
        },
      ],
    });
  }
  async updateInteractionStatusData(
    interactionId: string,
    data: InteractionStatus,
  ) {
    return this.prisma.interaction.update({
      where: {
        id: interactionId,
      },
      data: {
        seen: data.seen,
        clicked: data.clicked,
        done: data.done,
        succeeded: data.succeeded,
      },
    });
  }
}
