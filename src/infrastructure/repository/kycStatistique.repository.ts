import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class KycStatistiqueRepository {
  constructor(private prisma: PrismaService) {}

  async upsertStatistiquesDUneKyc(
    utilisateurId: string,
    kycId: string,
    titre: string,
    reponse: string,
  ) {
    await this.prisma.kycStatistique.upsert({
      where: {
        utilisateurId_kycId: {
          utilisateurId: utilisateurId,
          kycId: kycId,
        },
      },
      update: {
        titre: titre,
        reponse: reponse,
      },
      create: {
        utilisateurId: utilisateurId,
        kycId: kycId,
        titre: titre,
        reponse: reponse,
      },
    });
  }
}
