import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BlockText } from '@prisma/client';
import { BlockTextDefinition } from '../../domain/contenu/BlockTextDefinition';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlockTextRepository {
  constructor(private prisma: PrismaService) {
    BlockTextRepository.catalogue = new Map();
  }

  private static catalogue: Map<string, BlockTextDefinition>;

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.loadCache();
    } catch (error) {
      console.error(
        `Error loading BlockText definitions at startup, they will be available in less than a minute by cache refresh mecanism`,
      );
    }
  }
  @Cron('* * * * *')
  async loadCache(): Promise<void> {
    const result = await this.prisma.blockText.findMany();
    const new_map: Map<string, BlockTextDefinition> = new Map();
    for (const block of result) {
      new_map.set(block.code, {
        cms_id: block.id_cms,
        code: block.code,
        titre: block.titre,
        texte: block.texte,
      });
    }
    BlockTextRepository.catalogue = new_map;
  }

  public static resetCache() {
    // FOR TEST ONLY
    BlockTextRepository.catalogue = new Map();
  }

  public static getCodeIterator(): MapIterator<string> {
    return BlockTextRepository.catalogue.keys();
  }

  public static getTexteByCode(code: string): string {
    const result = BlockTextRepository.catalogue.get(code);
    return result.texte || '';
  }

  async upsert(block: BlockTextDefinition): Promise<void> {
    const block_db: BlockText = {
      id_cms: block.cms_id,
      code: block.code,
      titre: block.titre,
      texte: block.texte,
      created_at: undefined,
      updated_at: undefined,
    };
    await this.prisma.blockText.upsert({
      where: {
        id_cms: block.cms_id,
      },
      create: {
        ...block_db,
      },
      update: {
        ...block_db,
      },
    });
  }
  async delete(cms_id: string): Promise<void> {
    await this.prisma.blockText.delete({
      where: {
        id_cms: cms_id,
      },
    });
  }

  private buildDefinitionFromDB(block: BlockText): BlockTextDefinition {
    if (block === null) return null;
    return new BlockTextDefinition({
      cms_id: block.id_cms,
      code: block.code,
      titre: block.titre,
      texte: block.texte,
    });
  }
}
