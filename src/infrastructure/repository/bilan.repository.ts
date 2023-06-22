import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Prisma } from '@prisma/client';
import Publicodes from 'publicodes';
import { Situation } from 'src/infrastructure/api/types/bilan';

import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class BilanRepository {
  constructor(private prisma: PrismaService) {}

  async getBilan(simulation: Situation): Promise<any> {
    const rules = JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname, '../../publicode/co2.json'),
        'utf8',
      ),
    );

    const engine = new Publicodes(rules);

    const result = engine.setSituation(simulation).evaluate('bilan').nodeValue;

    return result;
  }
  /* async list(): Promise<Quizz[] | null> {
    return this.prisma.quizz.findMany();
  }
  async getById(id: string): Promise<Quizz | null> {
    return this.prisma.quizz.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });
  }
  async create(titre: string, id?: string): Promise<Quizz | null> {
    let response;
    try {
      response = await this.prisma.quizz.create({
        data: {
          id: id ? id : uuidv4(),
          titre,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            `Un quizz d'id ${id} existe déjà en base`,
          );
        }
      }
      throw error;
    }
    return response;
  }*/
}
