import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StatistiqueRepository {
  constructor(private prisma: PrismaService) {}

  async upsertStatistiquesDUnUtilisateur(
    utilisateurId: string,
    nombreDefisRealises: number,
    nombreDefisAbandonnes: number,
  ) {
    await this.prisma.statistique.upsert({
      where: { utilisateurId },
      create: {
        utilisateurId,
        nombre_defis_realises: nombreDefisRealises,
        nombre_defis_abandonnes: nombreDefisAbandonnes,
      },
      update: {
        nombre_defis_realises: nombreDefisRealises,
        nombre_defis_abandonnes: nombreDefisAbandonnes,
      },
    });
  }
}
