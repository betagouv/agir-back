import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CollectionQuestionsKYC } from '../../domain/kyc/questionsKYC';

@Injectable()
export class QuestionKYCRepository {
  constructor(private prisma: PrismaService) {}

  async delete(utilisateurId: string) {
    if (utilisateurId)
      await this.prisma.questionsKYC.deleteMany({ where: { utilisateurId } });
  }

  async getAll(utilisateurId: string): Promise<CollectionQuestionsKYC> {
    let reponse = await this.prisma.questionsKYC.findUnique({
      where: { utilisateurId },
    });
    return new CollectionQuestionsKYC(
      reponse === null ? null : (reponse.data as any),
    );
  }

  async update(
    utilisateurId: string,
    collection: CollectionQuestionsKYC,
  ): Promise<void> {
    await this.prisma.questionsKYC.upsert({
      where: { utilisateurId },
      create: {
        utilisateurId: utilisateurId,
        data: collection as any,
      },
      update: {
        data: collection as any,
      },
    });
  }
}
