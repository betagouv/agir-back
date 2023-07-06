import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Empreinte, Prisma } from '@prisma/client';
import Publicodes from 'publicodes';
import rules from '../data/co2.json';

type categorieBilan =
  | 'bilan'
  | 'alimentation'
  | 'transport'
  | 'divers'
  | 'services societaux'
  | 'logement';

@Injectable()
export class BilanRepository {
  constructor(private prisma: PrismaService) {}

  async evaluate(simulation: string, type: categorieBilan): Promise<number> {
    const engine = new Publicodes(rules as Record<string, any>);

    const result = engine
      .setSituation(JSON.parse(simulation || '{}'))
      .evaluate(type).nodeValue as string;

    return parseInt(result);
  }

  async evaluateDetails(simulation: string): Promise<object> {
    const engine = new Publicodes(rules as Record<string, any>);

    const transport = engine
      .setSituation(JSON.parse(simulation || '{}'))
      .evaluate('transport').nodeValue as string;
    const logement = engine
      .setSituation(JSON.parse(simulation || '{}'))
      .evaluate('logement').nodeValue as string;
    const divers = engine
      .setSituation(JSON.parse(simulation || '{}'))
      .evaluate('divers').nodeValue as string;
    const alimentation = engine
      .setSituation(JSON.parse(simulation || '{}'))
      .evaluate('alimentation').nodeValue as string;
    const services_societaux = engine
      .setSituation(JSON.parse(simulation || '{}'))
      .evaluate('services societaux').nodeValue as string;

    return {
      transport,
      logement,
      divers,
      alimentation,
      services_societaux,
    };
  }

  async getSituationforUserId(utilisateurId: string): Promise<string | null> {
    const empreinte = await this.prisma.empreinte.findFirst({
      where: { utilisateurId },
    });
    return empreinte?.situation;
  }

  async getBilanByUtilisateurId(utilisateurId): Promise<number> {
    const situation = await this.getSituationforUserId(utilisateurId);
    return this.evaluate(situation, 'bilan');
  }

  async create(
    situation: string,
    utilisateurId: any,
  ): Promise<Empreinte | null> {
    let response;

    console.log(situation);

    try {
      response = await this.prisma.empreinte.create({
        data: {
          id: uuidv4(),
          situation: situation,
          utilisateurId,
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
