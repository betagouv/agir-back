import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OfflineCounter } from '@prisma/client';
import { ActionDefinition } from '../../domain/actions/actionDefinition';
import { TypeAction } from '../../domain/actions/typeAction';
import {
  OfflineCounterDefinition,
  OfflineCounterType,
} from '../../domain/contenu/offlineCounterDefinition';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OfflineCounterRepository {
  constructor(private prisma: PrismaService) {
    OfflineCounterRepository.catalogue = new Map();
  }

  private static catalogue: Map<string, OfflineCounterDefinition>;

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.loadCache();
    } catch (error) {
      console.error(
        `Error loading OfflineCounterDefinitionat startup, they will be available in less than a minute by cache refresh mecanism`,
      );
    }
  }
  @Cron('* * * * *')
  async loadCache(): Promise<void> {
    const result = await this.prisma.offlineCounter.findMany();
    const new_map: Map<string, OfflineCounterDefinition> = new Map();
    for (const vue of result) {
      const vue_def = this.buildDefinitionFromDB(vue);
      new_map.set(this.getUniqueFonctionnalIdFromVue(vue_def), vue_def);
    }
    OfflineCounterRepository.catalogue = new_map;
  }

  public static resetCache() {
    // FOR TEST ONLY
    OfflineCounterRepository.catalogue = new Map();
  }

  public getCounterForAction(
    action_def: ActionDefinition,
  ): OfflineCounterDefinition {
    return OfflineCounterRepository.catalogue.get(
      this.getUniqueFonctionnalIdFromAction(action_def),
    );
  }

  async upsert(vue_def: OfflineCounterDefinition): Promise<void> {
    const vue_db: OfflineCounter = {
      id: vue_def.id,
      id_cms: vue_def.id_cms,
      code: vue_def.code,
      type: vue_def.type_contenu,
      nombre_vues: vue_def.nombre_vues,
      type_action: vue_def.type_action,
      created_at: undefined,
      updated_at: undefined,
    };
    await this.prisma.offlineCounter.upsert({
      where: {
        id: vue_db.id,
      },
      create: {
        ...vue_db,
      },
      update: {
        ...vue_db,
      },
    });
  }

  async incrementVues(id: string): Promise<void> {
    await this.prisma.offlineCounter.update({
      where: {
        id: id,
      },
      data: {
        nombre_vues: { increment: 1 },
      },
    });
  }

  private buildDefinitionFromDB(
    vueDB: OfflineCounter,
  ): OfflineCounterDefinition {
    if (vueDB === null) return undefined;
    return new OfflineCounterDefinition({
      id_cms: vueDB.id_cms,
      code: vueDB.code,
      type_contenu: OfflineCounterType[vueDB.type],
      id: vueDB.id,
      nombre_vues: vueDB.nombre_vues,
      type_action: TypeAction[vueDB.type_action],
    });
  }

  private getUniqueFonctionnalIdFromVue(vue: OfflineCounterDefinition): string {
    return vue.type_contenu + '_' + vue.code + '_' + vue.id_cms;
  }
  private getUniqueFonctionnalIdFromAction(
    action_def: ActionDefinition,
  ): string {
    return (
      OfflineCounterType.action +
      '_' +
      action_def.code +
      '_' +
      action_def.cms_id
    );
  }
}
