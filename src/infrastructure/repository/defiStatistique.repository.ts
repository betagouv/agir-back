import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DefiStatistiqueRepository {
  constructor(private prisma: PrismaService) {}

  async upsert(
    content_id: string,
    titre: string,
    nombre_defis_abandonnes: number,
    nombre_defis_deja_fait: number,
    nombre_defis_en_cours: number,
    nombre_defis_realises: number,
  ) {
    const data = {
      content_id: content_id,
      titre: titre,
      nombre_defis_abandonnes: nombre_defis_abandonnes,
      nombre_defis_deja_fait: nombre_defis_deja_fait,
      nombre_defis_en_cours: nombre_defis_en_cours,
      nombre_defis_realises: nombre_defis_realises,
    };
    await this.prisma.defiStatistique.upsert({
      where: { content_id: content_id },
      create: data,
      update: data,
    });
  }
}
