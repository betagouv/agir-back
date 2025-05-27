import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Prisma, Tag } from '@prisma/client';
import { TagDefinition } from '../../domain/contenu/TagDefinition';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagRepository {
  constructor(private prisma: PrismaService) {
    TagRepository.catalogue = new Map();
  }

  private static catalogue: Map<string, TagDefinition>;

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.loadCache();
    } catch (error) {
      console.error(
        `Error loading PonderationTag definitions at startup, they will be available in less than a minute by cache refresh mecanism`,
      );
    }
  }
  @Cron('* * * * *')
  async loadCache(): Promise<void> {
    const result = await this.prisma.tag.findMany();
    const new_map: Map<string, TagDefinition> = new Map();
    for (const tag of result) {
      new_map.set(tag.tag, this.buildDefinitionFromDB(tag));
    }
    TagRepository.catalogue = new_map;
  }

  public static resetCache() {
    // FOR TEST ONLY
    TagRepository.catalogue = new Map();
  }
  public static addToCache(tag: TagDefinition) {
    // FOR TEST ONLY
    TagRepository.catalogue.set(tag.tag, tag);
  }

  public static getTagDefinition(tag: string): TagDefinition {
    return TagRepository.catalogue.get(tag);
  }

  async upsert(tag_def: TagDefinition): Promise<void> {
    const pond_db: Tag = {
      id_cms: tag_def.cms_id,
      tag: tag_def.tag,
      description: tag_def.description,
      ponderation: tag_def.ponderation
        ? new Prisma.Decimal(tag_def.ponderation)
        : null,
      boost: tag_def.boost ? new Prisma.Decimal(tag_def.boost) : null,
      created_at: undefined,
      updated_at: undefined,
    };
    await this.prisma.tag.upsert({
      where: {
        id_cms: tag_def.cms_id,
      },
      create: {
        ...pond_db,
      },
      update: {
        ...pond_db,
      },
    });
  }
  async delete(cms_id: string): Promise<void> {
    await this.prisma.tag.delete({
      where: {
        id_cms: cms_id,
      },
    });
  }

  private buildDefinitionFromDB(ponderation: Tag): TagDefinition {
    if (ponderation === null) return undefined;
    return new TagDefinition({
      cms_id: ponderation.id_cms,
      tag: ponderation.tag,
      description: ponderation.description,
      ponderation: ponderation.ponderation?.toNumber(),
      boost: ponderation.boost?.toNumber(),
    });
  }
}
