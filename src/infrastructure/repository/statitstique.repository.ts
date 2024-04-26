import { PrismaService } from '../prisma/prisma.service';
//import { PrismaService as PrismaService_STATS } from '../prisma/stats/prisma.service.stats';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StatistiqueRepository {
  constructor(
    private prisma: PrismaService, //private prisma_stats: PrismaService_STATS,
  ) {}

  /*
  async upsertTestTable(id: string, value: string) {
    await this.prisma_stats.testTable.upsert({
      where: {
        id: id,
      },
      create: {
        id: id,
        type: value,
      },
      update: {
        type: value,
      },
    });
  }
  */
  async upsertStatistiquesDUnUtilisateur(
    utilisateurId: string,
    nombreDefisEnCours: number,
    nombreDefisRealises: number,
    nombreDefisAbandonnes: number,
    nombreDefisDejaFaitParUtilisateur: number,
  ) {
    await this.prisma.statistique.upsert({
      where: { utilisateurId },
      create: {
        utilisateurId,
        nombre_defis_en_cours: nombreDefisEnCours,
        nombre_defis_realises: nombreDefisRealises,
        nombre_defis_abandonnes: nombreDefisAbandonnes,
        nombre_defis_deja_fait: nombreDefisDejaFaitParUtilisateur,
      },
      update: {
        nombre_defis_en_cours: nombreDefisEnCours,
        nombre_defis_realises: nombreDefisRealises,
        nombre_defis_abandonnes: nombreDefisAbandonnes,
        nombre_defis_deja_fait: nombreDefisDejaFaitParUtilisateur,
      },
    });
  }
}
