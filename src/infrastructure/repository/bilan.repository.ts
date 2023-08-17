import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Empreinte, SituationNGC } from '@prisma/client';
import { Bilan } from '../../../src/domain/bilan/bilan';
import { BilanExtra } from '../../../src/domain/bilan/bilanExtra';

@Injectable()
export class BilanRepository {
  constructor(private prisma: PrismaService) {}

  async getLastSituationbyUtilisateurId(
    utilisateurId: string,
  ): Promise<any | null> {
    const empreintes = await this.prisma.empreinte.findMany({
      where: { utilisateurId },
      orderBy: { created_at: 'desc' },
      take: 1,
      include: {
        situation: true,
      },
    });
    return empreintes[0]?.situation.situation;
  }

  async getSituationNGCbyId(id: string): Promise<SituationNGC | null> {
    return this.prisma.situationNGC.findUnique({
      where: { id },
    });
  }

  async getLastBilanByUtilisateurId(
    utilisateurId: string,
  ): Promise<BilanExtra> {
    const empreintes = await this.prisma.empreinte.findMany({
      where: { utilisateurId },
      orderBy: { created_at: 'desc' },
      include: {
        situation: true,
      },
      take: 1,
    });
    if (empreintes.length === 0) {
      return null;
    }
    return this.buildBilanExtraFromEmpreinte(empreintes[0]);
  }

  async getAllBilansByUtilisateurId(utilisateurId): Promise<BilanExtra[]> {
    const empreintes = await this.prisma.empreinte.findMany({
      where: { utilisateurId },
      orderBy: { created_at: 'desc' },
    });
    return empreintes.map((empreinte) => {
      return this.buildBilanExtraFromEmpreinte(empreinte);
    });
  }

  async createBilan(
    situationId: string,
    utilisateurId: string,
    bilan: Bilan,
  ): Promise<Empreinte | null> {
    return await this.prisma.empreinte.create({
      data: {
        id: uuidv4(),
        situationId,
        utilisateurId,
        bilan,
      },
    });
  }

  async createSituation(situation: object): Promise<SituationNGC | null> {
    return this.prisma.situationNGC.create({
      data: {
        id: uuidv4(),
        situation: situation,
      },
    });
  }

  private buildBilanExtraFromEmpreinte(empreinte: Empreinte): BilanExtra {
    return {
      id: empreinte.id,
      created_at: empreinte.created_at,
      situation: empreinte['situation'],
      ...(empreinte.bilan as Bilan),
    };
  }
}
