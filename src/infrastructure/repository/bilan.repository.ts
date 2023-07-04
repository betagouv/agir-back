import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Empreinte, Prisma } from '@prisma/client';
import Publicodes from 'publicodes';
import rules from '../data/co2.json';

import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class BilanRepository {
  constructor(private prisma: PrismaService) {}

  async evaluateSituation(simulation: string): Promise<number> {
    const engine = new Publicodes(rules as Record<string, any>);

    const result = engine
      .setSituation(JSON.parse(simulation || '{}'))
      .evaluate('bilan').nodeValue as string;

    return parseInt(result);
  }

  async getSituationforUserId(utilisateurId: string): Promise<string | null> {
    const empreinte = await this.prisma.empreinte.findFirst({
      where: { utilisateurId },
    });
    return empreinte?.situation;
  }

  async getBilanByUtilisateurId(utilisateurId): Promise<number> {
    const situation = await this.getSituationforUserId(utilisateurId);
    return this.evaluateSituation(situation);
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
