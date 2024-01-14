import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Ponderation } from '.prisma/client';

@Injectable()
export class PonderationRepository {
  constructor(private prisma: PrismaService) {}

  async upsert(ponderation: Ponderation) {
    await this.prisma.ponderation.upsert({
      where: {
        id: ponderation.id,
      },
      create: ponderation,
      update: ponderation,
    });
  }
}
