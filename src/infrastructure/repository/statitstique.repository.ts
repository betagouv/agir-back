import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StatistiqueRepository {
  constructor(private prisma: PrismaService) {}

  async upsertStatistiquesDUnUtilisateur(
    utilisateurId: string,
    nombreDefisEnCours: number,
    nombreDefisRealises: number,
    nombreDefisAbandonnes: number,
    nombreDefisPasEnvieParUtilisateur: number,
    thematiquesTerminees: string,
    thematiquesEnCours: string,
  ) {
    await this.prisma.statistique.upsert({
      where: { utilisateurId },
      create: {
        utilisateurId,
        nombre_defis_en_cours: nombreDefisEnCours,
        nombre_defis_realises: nombreDefisRealises,
        nombre_defis_abandonnes: nombreDefisAbandonnes,
        nombre_defis_pas_envie: nombreDefisPasEnvieParUtilisateur,
        thematiques_terminees: thematiquesTerminees,
        thematiques_en_cours: thematiquesEnCours,
      },
      update: {
        nombre_defis_en_cours: nombreDefisEnCours,
        nombre_defis_realises: nombreDefisRealises,
        nombre_defis_abandonnes: nombreDefisAbandonnes,
        nombre_defis_pas_envie: nombreDefisPasEnvieParUtilisateur,
        thematiques_terminees: thematiquesTerminees,
      },
    });
  }
}
