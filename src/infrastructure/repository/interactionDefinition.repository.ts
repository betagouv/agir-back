import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InteractionDefinition } from '../../../src/domain/interaction/interactionDefinition';

@Injectable()
export class InteractionDefinitionRepository {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<InteractionDefinition[] | null> {
    let result = await this.prisma.interactionDefinition.findMany({});
    return result.map((inter) => new InteractionDefinition(inter));
  }
  async createOrUpdateInteractionDefinition(
    interaction: InteractionDefinition,
  ) {
    await this.prisma.interactionDefinition.upsert({
      where: {
        id: interaction.id,
      },
      create: interaction,
      update: interaction,
    });
  }
}
