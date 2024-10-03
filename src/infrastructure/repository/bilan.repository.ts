import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Empreinte, Prisma, SituationNGC } from '@prisma/client';
import { Bilan } from '../../../src/domain/bilan/bilan';
import { BilanExtra } from '../../../src/domain/bilan/bilanExtra';
import { ApplicationError } from '../applicationError';

@Injectable()
export class BilanRepository {
  constructor(private prisma: PrismaService) {}

  async delete(utilisateurId: string) {
    if (utilisateurId)
      await this.prisma.empreinte.deleteMany({ where: { utilisateurId } });
  }

  /*
  async getLastSituationbyUtilisateurId(utilisateurId: string): Promise<any> {
    const empreintes = await this.prisma.empreinte.findMany({
      where: { utilisateurId },
      orderBy: { created_at: 'desc' },
      take: 1,
      include: {
        situation: true,
      },
    });
    return !empreintes.length ? {} : empreintes[0]['situation'].situation;
  }
*/
  async getSituationNGCbyId(id: string): Promise<SituationNGC | null> {
    return this.prisma.situationNGC.findUnique({
      where: { id },
    });
  }

  /*
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
    */

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
    let response;
    try {
      response = await this.prisma.empreinte.create({
        data: {
          id: uuidv4(),
          situationId,
          utilisateurId,
          bilan,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          ApplicationError.throwSituationAlreadyExistsError(
            situationId,
            utilisateurId,
          );
        }
      }
      throw error;
    }
    return response;
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

  private buildBilanExtraFromEmpreinte(empreinte: Empreinte): BilanExtra {
    return {
      id: empreinte.id,
      created_at: empreinte.created_at,
      situation: empreinte['situation'],
      ...(empreinte.bilan as Bilan),
    };
  }
}
