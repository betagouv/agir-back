import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ThematiqueStatistiqueRepository {
  constructor(private prisma: PrismaService) {}

  async upsert(
    universId: string,
    titre: string,
    completionPourcentage1_20: number,
    completionPourcentage21_40: number,
    completionPourcentage41_60: number,
    completionPourcentage61_80: number,
    completionPourcentage81_99: number,
    completionPourcentage100: number,
  ) {
    await this.prisma.universStatistique.upsert({
      where: { universId },
      create: {
        universId,
        titre,
        completion_pourcentage_1_20: completionPourcentage1_20,
        completion_pourcentage_21_40: completionPourcentage21_40,
        completion_pourcentage_41_60: completionPourcentage41_60,
        completion_pourcentage_61_80: completionPourcentage61_80,
        completion_pourcentage_81_99: completionPourcentage81_99,
        completion_pourcentage_100: completionPourcentage100,
      },
      update: {
        completion_pourcentage_1_20: completionPourcentage1_20,
        completion_pourcentage_21_40: completionPourcentage21_40,
        completion_pourcentage_41_60: completionPourcentage41_60,
        completion_pourcentage_61_80: completionPourcentage61_80,
        completion_pourcentage_81_99: completionPourcentage81_99,
        completion_pourcentage_100: completionPourcentage100,
      },
    });
  }
}
