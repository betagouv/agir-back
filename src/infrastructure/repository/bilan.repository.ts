import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Empreinte, Prisma, SituationNGC } from '@prisma/client';
import Publicodes from 'publicodes';
import rules from '../data/co2.json';

type Bilan = {
  bilan_carbone_annuel: number;
  details: {
    divers: number;
    logement: number;
    transport: number;
    alimentation: number;
    services_societaux: number;
  };
};

type BilanExtra = Bilan & {
  created_at: Date;
  id: string;
};

@Injectable()
export class BilanRepository {
  constructor(private prisma: PrismaService) {}

  async evaluateBilan(situation: any): Promise<object> {
    const engine = new Publicodes(rules as Record<string, any>);

    const categories = {
      bilan_carbone_annuel: 'bilan',
      transport: 'transport . empreinte',
      logement: 'logement',
      divers: 'divers',
      alimentation: 'alimentation',
      services_societaux: 'services sociétaux',
    };

    Object.keys(categories).forEach(function (key) {
      categories[key] = engine
        .setSituation(situation || '{}')
        .evaluate(categories[key]).nodeValue as string;
    });

    return {
      bilan_carbone_annuel: categories['bilan_carbone_annuel'],
      details: {
        transport: categories['transport'],
        logement: categories['logement'],
        divers: categories['divers'],
        alimentation: categories['alimentation'],
        services_societaux: categories['services_societaux'],
      },
    };
  }

  async getSituationbyUtilisateurId(
    utilisateurId: string,
  ): Promise<string | null> {
    const empreintes = await this.prisma.empreinte.findMany({
      where: { utilisateurId },
      orderBy: { created_at: 'desc' },
      take: 1,
      include: {
        situation: true,
      },
    });
    return empreintes[0]?.situation.toString();
  }

  async getSituationNGCbyId(id: string): Promise<SituationNGC | null> {
    const situation = await this.prisma.situationNGC.findUnique({
      where: { id },
    });
    return situation;
  }

  async getLastBilanByUtilisateurId(utilisateurId): Promise<BilanExtra | null> {
    const empreintes = await this.prisma.empreinte.findMany({
      where: { utilisateurId },
      orderBy: { created_at: 'desc' },
      take: 1,
    });
    if (empreintes.length === 0) {
      return null;
    }
    const empreinte = empreintes[0];
    const bilan = empreinte?.bilan as Bilan;
    return {
      ...bilan,
      created_at: empreinte.created_at,
      id: empreinte.id,
    };
  }

  async getAllBilansByUtilisateurId(utilisateurId): Promise<BilanExtra[]> {
    const empreintes = await this.prisma.empreinte.findMany({
      where: { utilisateurId },
    });
    const bilans = empreintes.map((empreinte) => {
      const bilan = empreinte.bilan as Bilan;
      return {
        created_at: empreinte.created_at,
        id: empreinte.id,
        bilan_carbone_annuel: bilan.bilan_carbone_annuel,
        details: bilan.details,
      };
    });
    return bilans;
  }

  async createBilan(
    situationNGC: SituationNGC,
    utilisateurId: string,
  ): Promise<Empreinte | null> {
    let response;
    try {
      response = await this.prisma.empreinte.create({
        data: {
          id: uuidv4(),
          situationId: situationNGC.id,
          utilisateurId,
          bilan: await this.evaluateBilan(situationNGC.situation),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(`Une empreinte existe déjà en base`);
        }
      }
      throw error;
    }
    return response;
  }

  async createSituation(situation: any): Promise<Empreinte | null> {
    let response;
    try {
      response = await this.prisma.situationNGC.create({
        data: {
          id: uuidv4(),
          situation: situation,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(`Une empreinte existe déjà en base`);
        }
      }
      throw error;
    }
    return response;
  }
}
