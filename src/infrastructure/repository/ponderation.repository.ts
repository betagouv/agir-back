import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  RubriquePonderationSetName,
  RubriquePonderationSetValues,
} from '../../../src/usecase/referentiel/ponderation';

@Injectable()
export class PonderationRepository {
  constructor(private prisma: PrismaService) {}

  async upsert(
    set: RubriquePonderationSetName,
    ponderations: RubriquePonderationSetValues,
  ) {
    await this.prisma.ponderationRubriques.upsert({
      where: {
        id: set,
      },
      create: {
        id: set,
        rubriques: ponderations,
      },
      update: {
        rubriques: ponderations,
      },
    });
  }
}
