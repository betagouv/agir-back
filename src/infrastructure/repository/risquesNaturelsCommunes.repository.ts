import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RisquesNaturelsCommunes } from '@prisma/client';
import { RisquesNaturelsCommunesDefinition } from '../../domain/logement/RisquesNaturelsCommuneDefinition';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RisquesNaturelsCommunesRepository {
  constructor(private prisma: PrismaService) {
    RisquesNaturelsCommunesRepository.catalogue = new Map();
  }

  private static catalogue: Map<string, RisquesNaturelsCommunesDefinition>;

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.loadCache();
    } catch (error) {
      console.error(
        `Error loading RisquesNaturelsCommunesDefinition definitions at startup, they will be available in less than a minute by cache refresh mecanism`,
      );
    }
  }
  @Cron('* * * * *')
  async loadCache(): Promise<void> {
    const result = await this.prisma.risquesNaturelsCommunes.findMany();
    const new_map: Map<string, RisquesNaturelsCommunesDefinition> = new Map();
    for (const risque of result) {
      new_map.set(risque.code_commune, {
        code_commune: risque.code_commune,
        nom_commune: risque.nom_commune,
        nombre_cat_nat: risque.nombre_cat_nat,
        pourcentage_risque_innondation: risque.pourcentage_inondation,
        pourcentage_risque_secheresse: risque.pourcentage_secheresse,
      });
    }
    RisquesNaturelsCommunesRepository.catalogue = new_map;
  }

  public static resetCache() {
    // FOR TEST ONLY
    RisquesNaturelsCommunesRepository.catalogue = new Map();
  }

  public getRisquesCommune(
    code_commune: string,
  ): RisquesNaturelsCommunesDefinition {
    return RisquesNaturelsCommunesRepository.catalogue.get(code_commune);
  }

  async upsert(risque: RisquesNaturelsCommunesDefinition): Promise<void> {
    const data: RisquesNaturelsCommunes = {
      code_commune: risque.code_commune,
      nom_commune: risque.nom_commune,
      nombre_cat_nat: risque.nombre_cat_nat,
      pourcentage_inondation: risque.pourcentage_risque_innondation,
      pourcentage_secheresse: risque.pourcentage_risque_secheresse,
      created_at: undefined,
      updated_at: undefined,
    };
    await this.prisma.risquesNaturelsCommunes.upsert({
      where: {
        code_commune: risque.code_commune,
      },
      create: {
        ...data,
      },
      update: {
        ...data,
      },
    });
  }
}
