import { Injectable } from '@nestjs/common';
import { SituationNGC } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SituationNGCRepository {
  constructor(private prisma: PrismaService) {}

  async getSituationNGCbyId(id: string): Promise<SituationNGC | null> {
    return this.prisma.situationNGC.findUnique({
      where: { id },
    });
  }

  async countAllWithUserId(): Promise<number> {
    return this.prisma.situationNGC.count({
      where: {
        utilisateurId: {
          not: null,
        },
      },
    });
  }

  async listeIdsLinkedToUser(
    skip: number,
    take: number,
  ): Promise<{ id: string; user_id: string }[]> {
    const result = await this.prisma.situationNGC.findMany({
      skip: skip,
      take: take,
      orderBy: {
        id: 'desc',
      },
      where: {
        utilisateurId: {
          not: null,
        },
      },
      select: {
        id: true,
        utilisateurId: true,
      },
    });
    return result.map((r) => ({ id: r.id, user_id: r.utilisateurId }));
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

  async setUtilisateurIdToSituation(
    utilisateurId: string,
    situationId: string,
  ): Promise<void> {
    await this.prisma.situationNGC.update({
      where: {
        id: situationId,
      },
      data: {
        utilisateurId: utilisateurId,
      },
    });
  }

  async getSituationByUtilisateurId(
    id: string,
  ): Promise<SituationNGC | undefined> {
    return this.prisma.situationNGC.findFirst({
      where: {
        utilisateurId: id,
      },
    });
  }
}
