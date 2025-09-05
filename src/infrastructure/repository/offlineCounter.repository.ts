import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OfflineCounter } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ActionDefinition } from '../../domain/actions/actionDefinition';
import { TypeAction } from '../../domain/actions/typeAction';
import {
  OfflineCounterDefinition,
  OfflineCounterInitialisator,
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

  async insertOrIncrementCounter(
    vue_def: OfflineCounterInitialisator,
  ): Promise<void> {
    const vue_db: OfflineCounter = {
      composite_id: this.getUniqueFonctionnalIdFromVue(vue_def),
      id_cms: vue_def.id_cms,
      code: vue_def.code,
      type_contenu: vue_def.type_contenu,
      type_action: vue_def.type_action,
      id: undefined,
      created_at: undefined,
      updated_at: undefined,
      nombre_vues: undefined,
    };
    await this.prisma.offlineCounter.upsert({
      where: {
        composite_id: vue_db.composite_id,
      },
      create: {
        ...vue_db,
        id: uuidv4(),
        nombre_vues: 1,
      },
      update: {
        nombre_vues: { increment: 1 },
      },
    });
  }

  private buildDefinitionFromDB(
    vueDB: OfflineCounter,
  ): OfflineCounterDefinition {
    if (vueDB === null) return undefined;
    return {
      id_cms: vueDB.id_cms,
      code: vueDB.code,
      type_contenu: OfflineCounterType[vueDB.type_contenu],
      id: vueDB.id,
      nombre_vues: vueDB.nombre_vues,
      type_action: TypeAction[vueDB.type_action],
    };
  }

  private getUniqueFonctionnalIdFromVue(
    vue: OfflineCounterDefinition | OfflineCounterInitialisator,
  ): string {
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
