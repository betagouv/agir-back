import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InteractionDefinition as InteractionDefinitionDB } from '@prisma/client';
import { InteractionDefinition } from '../../../src/domain/interaction/interactionDefinition';

@Injectable()
export class InteractionDefinitionRepository {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<InteractionDefinitionDB[] | null> {
    return await this.prisma.interactionDefinition.findMany({});
  }
  async createOrUpdateInteractionDefinition(
    interaction: InteractionDefinition,
  ): Promise<InteractionDefinitionDB | null> {
    return this.prisma.interactionDefinition.upsert({
      where: {
        id: interaction.id,
      },
      create: interaction,
      update: interaction,
    });
  }
}
