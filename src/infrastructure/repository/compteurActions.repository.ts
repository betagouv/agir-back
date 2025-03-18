import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CompteurActions } from '@prisma/client';
import {
  ActionDefinition,
  TypeCodeAction,
} from '../../domain/actions/actionDefinition';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompteurActionsRepository {
  constructor(private prisma: PrismaService) {
    CompteurActionsRepository.catalogue = new Map();
  }

  private static catalogue: Map<string, CompteurActions>;

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.loadCache();
    } catch (error) {
      console.error(
        `Error loading CompteurAction cache at startup, they will be available in less than a minute by cache refresh mecanism`,
      );
    }
  }
  @Cron('*/5 * * * *')
  async loadCache(): Promise<void> {
    const new_map: Map<string, CompteurActions> = new Map();

    const liste = await this.prisma.compteurActions.findMany();
    for (const action_db of liste) {
      new_map.set(action_db.type_code_id, action_db);
    }
    CompteurActionsRepository.catalogue = new_map;
  }

  public static resetCache() {
    // FOR TEST ONLY
    CompteurActionsRepository.catalogue = new Map();
  }

  public getNombreVues(type_code: TypeCodeAction): number {
    const compteur = CompteurActionsRepository.catalogue.get(
      ActionDefinition.getIdFromTypeCode(type_code),
    );
    return compteur ? compteur.vues : 0;
  }
  public getNombreFaites(type_code: TypeCodeAction): number {
    const compteur = CompteurActionsRepository.catalogue.get(
      ActionDefinition.getIdFromTypeCode(type_code),
    );
    return compteur ? compteur.faites : 0;
  }
  public async getTotalFaites(): Promise<number> {
    const agregate = await this.prisma.compteurActions.aggregate({
      _sum: { faites: true },
    });
    return agregate._sum.faites;
  }

  async setCompteur(action: TypeCodeAction, vues: number, faites: number) {
    await this.prisma.compteurActions.upsert({
      where: {
        type_code_id: ActionDefinition.getIdFromTypeCode(action),
      },
      create: {
        code: action.code,
        type: action.type,
        type_code_id: ActionDefinition.getIdFromTypeCode(action),
        faites: faites,
        vues: vues,
      },
      update: {
        vues: vues,
        faites: faites,
      },
    });
  }

  async incrementVue(type_code: TypeCodeAction): Promise<void> {
    const type_code_id = ActionDefinition.getIdFromTypeCode(type_code);
    const result = await this.prisma.compteurActions.upsert({
      where: {
        type_code_id: type_code_id,
      },
      create: {
        code: type_code.code,
        type: type_code.type,
        type_code_id: type_code_id,
        faites: 0,
        vues: 1,
      },
      update: {
        vues: {
          increment: 1,
        },
      },
    });
    CompteurActionsRepository.catalogue.set(type_code_id, result);
  }
  async incrementFaite(type_code: TypeCodeAction): Promise<void> {
    const type_code_id = ActionDefinition.getIdFromTypeCode(type_code);

    const result = await this.prisma.compteurActions.upsert({
      where: {
        type_code_id: type_code_id,
      },
      create: {
        code: type_code.code,
        type: type_code.type,
        type_code_id: type_code_id,
        faites: 1,
        vues: 0,
      },
      update: {
        faites: {
          increment: 1,
        },
      },
    });
    CompteurActionsRepository.catalogue.set(type_code_id, result);
  }
}
