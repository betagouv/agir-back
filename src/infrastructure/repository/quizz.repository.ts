import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Quizz } from '../../../src/domain/quizz/quizz';

@Injectable()
export class QuizzRepository {
  constructor(private prisma: PrismaService) {}

  async upsert(quizz: Quizz): Promise<void> {
    await this.prisma.quizz.upsert({
      where: { content_id: quizz.content_id },
      create: {
        ...quizz,
        created_at: undefined,
        updated_at: undefined,
      },
      update: {
        ...quizz,
        updated_at: undefined,
      },
    });
  }
}
