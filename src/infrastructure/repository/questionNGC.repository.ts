import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { Question } from '../../../src/domain/bilan/question';

@Injectable()
export class QuestionNGCRepository {
  constructor(private prisma: PrismaService) {}

  async saveOrUpdateQuestion(
    utilisateurId: string,
    key: string,
    value: any,
  ): Promise<Question | null> {
    return this.prisma.questionNGC.upsert({
      where: {
        key_utilisateurId: {
          utilisateurId,
          key,
        },
      },
      create: {
        id: uuidv4(),
        key,
        value: value.toString(),
        utilisateurId,
      },
      update: {
        value: value.toString(),
      },
    });
  }
  async getAllQuestionForUtilisateur(
    utilisateurId: string,
  ): Promise<Question[] | null> {
    const liste = await this.prisma.questionNGC.findMany({
      where: { utilisateurId },
    });
    return liste.map((element) => {
      return { key: element.key, value: element.value };
    });
  }
}
