import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Selection as SelectionDB } from '@prisma/client';
import { Selection } from '../../domain/contenu/selection';
import { SelectionDefinition } from '../../domain/contenu/SelectionDefinition';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SelectionRepository {
  constructor(private prisma: PrismaService) {
    SelectionRepository.catalogue = new Map();
  }

  private static catalogue: Map<string, SelectionDefinition>;

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.loadCache();
    } catch (error) {
      console.error(
        `Error loading Selection definitions at startup, they will be available in less than a minute by cache refresh mecanism`,
      );
    }
  }
  @Cron('* * * * *')
  async loadCache(): Promise<void> {
    const result = await this.prisma.selection.findMany();
    const new_map: Map<string, SelectionDefinition> = new Map();
    for (const selection of result) {
      new_map.set(selection.code, this.buildDefinitionFromDB(selection));
    }
    SelectionRepository.catalogue = new_map;
  }

  public static resetCache() {
    // FOR TEST ONLY
    SelectionRepository.catalogue = new Map();
  }
  public static addToCache(selection: SelectionDefinition) {
    // FOR TEST ONLY
    SelectionRepository.catalogue.set(selection.code, selection);
  }

  public static getSelectionDefinition(code: string): SelectionDefinition {
    return SelectionRepository.catalogue.get(code);
  }
  public static getCatalogue(): Map<string, SelectionDefinition> {
    return SelectionRepository.catalogue;
  }

  public static getLabel(selection: Selection): string {
    return selection;
  }

  async upsert(selection_def: SelectionDefinition): Promise<void> {
    const select_db: SelectionDB = {
      id_cms: selection_def.cms_id,
      code: selection_def.code,
      description: selection_def.description,
      image_url: selection_def.image_url,
      titre: selection_def.titre,
      created_at: undefined,
      updated_at: undefined,
    };
    await this.prisma.selection.upsert({
      where: {
        id_cms: select_db.id_cms,
      },
      create: {
        ...select_db,
      },
      update: {
        ...select_db,
      },
    });
  }
  async delete(cms_id: string): Promise<void> {
    await this.prisma.selection.delete({
      where: {
        id_cms: cms_id,
      },
    });
  }

  private buildDefinitionFromDB(selection: SelectionDB): SelectionDefinition {
    if (selection === null) return undefined;
    return new SelectionDefinition({
      cms_id: selection.id_cms,
      code: selection.code,
      description: selection.description,
      image_url: selection.image_url,
      titre: selection.titre,
    });
  }
}
