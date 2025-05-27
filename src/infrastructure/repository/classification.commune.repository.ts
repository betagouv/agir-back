import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  ClassificationCommune,
  ClassificationCommuneDefinition,
} from '../../domain/logement/classificationCommuneDefinition';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassificationCommuneRepository {
  private static catalogue_classification: Map<
    string,
    ClassificationCommuneDefinition
  >;

  constructor(private prisma: PrismaService) {
    ClassificationCommuneRepository.catalogue_classification = new Map();
  }

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.loadCache();
    } catch (error) {
      console.error(
        `Error loading communes classification definitions at startup, they will be available in less than a minute by cache refresh mecanism`,
      );
    }
  }

  public static getCommuneClassification(
    code_commune: string,
  ): ClassificationCommuneDefinition {
    return ClassificationCommuneRepository.catalogue_classification.get(
      code_commune,
    );
  }
  public static resetCache() {
    // FOR TEST ONLY
    ClassificationCommuneRepository.catalogue_classification = new Map();
  }

  @Cron('* * * * *')
  public async loadCache() {
    const new_map: Map<string, ClassificationCommuneDefinition> = new Map();
    const liste = await this.prisma.classificationCommune.findMany();
    for (const classification of liste) {
      new_map.set(classification.code_commune, {
        est_drom: classification.est_drom,
        code_commune: classification.code_commune,
        classification: ClassificationCommune[classification.classification],
        CATEAAV2020: classification.CATEAAV2020,
        TAAV2017: classification.TAAV2017,
      });
    }
    ClassificationCommuneRepository.catalogue_classification = new_map;
  }
}
