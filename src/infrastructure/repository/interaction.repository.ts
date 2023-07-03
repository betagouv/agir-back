import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Interaction } from '@prisma/client';

@Injectable()
export class InteractionRepository {
  constructor(private prisma: PrismaService) {}

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
}
