import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BilanCarboneStatistiqueRepository {
  constructor(private prisma: PrismaService) {}

  async upsertStatistiques(
    utilisateurId: string,
    situation: object,
    total: number,
    transport: number,
    alimentation: number,
  ) {
    await this.prisma.bilanCarboneStatistique.upsert({
      where: {
        utilisateurId: utilisateurId,
      },
      update: {
        situation: situation,
        total_g: total,
        alimenation_g: alimentation,
        transport_g: transport,
      },
      create: {
        utilisateurId: utilisateurId,
        situation: situation,
        total_g: total,
        alimenation_g: alimentation,
        transport_g: transport,
      },
    });
  }
}
