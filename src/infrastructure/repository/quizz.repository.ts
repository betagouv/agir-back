import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Quizz, Prisma } from '@prisma/client';

@Injectable()
export class QuizzRepository {
  constructor(private prisma: PrismaService) { }

  async list(): Promise<Quizz[] | null> {
    return this.prisma.quizz.findMany();
  }
  async getById(id: string): Promise<Quizz | null> {
    return this.prisma.quizz.findUnique({
      where: { id },
      include: {
        questions: true
      }
    });
  }
  async getByListOfIds(listIds: string[]): Promise<Quizz[] | null> {
    return this.prisma.quizz.findMany({
      where: {id : {in : listIds}}
    });
  }

  async create(titre: string, id?: string): Promise<Quizz | null> {
    let response;
    try {
      response = await this.prisma.quizz.create({
        data: {
          id: id ? id : uuidv4(),
          titre
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(`Un quizz d'id ${id} existe déjà en base`);
        }
      }
      throw error;
    }
    return response;
  }
}
