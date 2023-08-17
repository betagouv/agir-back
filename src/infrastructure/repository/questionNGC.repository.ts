import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { QuestionNGC } from '@prisma/client';

@Injectable()
export class QuestionNGCRepository {
  constructor(private prisma: PrismaService) {}

  async saveOrUpdateQuestion(
    utilisateurId: string,
    key: string,
    value: string,
  ): Promise<QuestionNGC | null> {
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
        value,
        utilisateurId,
      },
      update: {
        value,
      },
    });
  }
}
