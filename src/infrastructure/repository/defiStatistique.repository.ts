import { DefiStatistique } from '../../../src/domain/defis/defiStatistique';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DefiStatistiqueRepository {
  constructor(private prisma: PrismaService) {}

  async upsert(
    content_id: string,
    titre: string,
    nombre_defis_abandonnes: number,
    nombre_defis_pas_envie: number,
    nombre_defis_en_cours: number,
    nombre_defis_realises: number,
    raisonsPasEnvie: string[],
  ) {
    const data = {
      content_id: content_id,
      titre: titre,
      nombre_defis_abandonnes: nombre_defis_abandonnes,
      nombre_defis_pas_envie: nombre_defis_pas_envie,
      nombre_defis_en_cours: nombre_defis_en_cours,
      nombre_defis_realises: nombre_defis_realises,
      raisons_defi_pas_envie: raisonsPasEnvie,
    };

    await this.prisma.defiStatistique.upsert({
      where: { content_id: content_id },
      create: data,
      update: data,
    });
  }

  async getBy(content_id: string): Promise<DefiStatistique> {
    const defiStatistiqueReponse = await this.prisma.defiStatistique.findUnique(
      {
        where: { content_id },
      },
    );

    if (defiStatistiqueReponse) {
      return {
        titre: defiStatistiqueReponse.titre,
        nbr_abandon: defiStatistiqueReponse.nombre_defis_abandonnes,
        nbr_pas_envie: defiStatistiqueReponse.nombre_defis_pas_envie,
        nbr_en_cours: defiStatistiqueReponse.nombre_defis_en_cours,
        nbr_realise: defiStatistiqueReponse.nombre_defis_realises,
        raisons_pas_envie: defiStatistiqueReponse.raisons_defi_pas_envie,
      };
    }

    return {
      titre: undefined,
      nbr_abandon: 0,
      nbr_pas_envie: 0,
      nbr_en_cours: 0,
      nbr_realise: 0,
      raisons_pas_envie: [],
    };
  }
}
