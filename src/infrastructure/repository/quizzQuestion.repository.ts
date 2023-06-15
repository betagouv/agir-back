import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { QuizzQuestion, Prisma } from '@prisma/client';

@Injectable()
export class QuizzQuestionRepository {
  constructor(private prisma: PrismaService) { }

  async list(): Promise<QuizzQuestion[] | null> {
    return this.prisma.quizzQuestion.findMany({});
  }
  async getById(id: string): Promise<QuizzQuestion | null> {
    return this.prisma.quizzQuestion.findUnique({ where: { id } });
  }
  async create(libelle: string, solution:string, propositions:string[], quizzId:string, id?: string): Promise<QuizzQuestion | null> {
    let response;
    try {
      response = await this.prisma.quizzQuestion.create({
        data: {
          id: id ? id : uuidv4(),
          quizzId,
          libelle,
          propositions,
          solution
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(`Une question de quizz d'id ${id} existe déjà en base`);
        }
        if (error.code === 'P2003') {
          throw new BadRequestException(`Aucun questionnaire d'id ${quizzId} n'existe en base`);
        }
    }
      throw error;
    }
    return response;
  }
}
