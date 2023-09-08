import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Quizz as QuizzDB, Prisma } from '@prisma/client';
import { Quizz } from 'src/domain/quizz/quizz';

@Injectable()
export class QuizzRepository {
  constructor(private prisma: PrismaService) {}

  async getById(id: string): Promise<Quizz | null> {
    const result = await this.prisma.quizz.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });
    return result as Quizz;
  }
}
