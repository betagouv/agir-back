import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SituationNGC } from '@prisma/client';

@Injectable()
export class SituationNGCRepository {
  constructor(private prisma: PrismaService) {}

  async getSituationNGCbyId(id: string): Promise<SituationNGC | null> {
    return this.prisma.situationNGC.findUnique({
      where: { id },
    });
  }

  async createSituation(situation: object): Promise<string> {
    const id_situation = uuidv4();
    await this.prisma.situationNGC.create({
      data: {
        id: id_situation,
        situation: situation,
      },
    });
    return id_situation;
  }
}
