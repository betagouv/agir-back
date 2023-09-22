import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InteractionDefinition } from '../../../src/domain/interaction/interactionDefinition';
import { InteractionType } from 'src/domain/interaction/interactionType';

@Injectable()
export class InteractionDefinitionRepository {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<InteractionDefinition[] | null> {
    let result = await this.prisma.interactionDefinition.findMany({});
    return result.map((inter) => new InteractionDefinition(inter));
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
    return result ? new InteractionDefinition(result) : null;
  }

  async deleteByContentId(content_id: string) {
    await this.prisma.interactionDefinition.deleteMany({
      where: {
        content_id,
      },
    });
  }
}
