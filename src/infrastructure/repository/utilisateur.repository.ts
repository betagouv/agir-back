import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Utilisateur, Prisma } from '@prisma/client';

@Injectable()
export class UtilisateurRepository {
  constructor(private prisma: PrismaService) {}

  async findFirstUtilisateursByName(
    name: string
  ): Promise<Utilisateur | null> {
    return this.prisma.utilisateur.findFirst({
      where: {
        name
      },
    });
  }
  async findUtilisateurById(
    id: string
  ): Promise<Utilisateur | null> {
    return this.prisma.utilisateur.findUnique({
      where: {
        id
      },
    });
  }

  async listUtilisateur(): Promise<Utilisateur[] | null> {
    return this.prisma.utilisateur.findMany({});
  }

  async createUtilisateur(
    name: string,
    id?: string
  ): Promise<Utilisateur | null> {
    let response
    try {
      response = await this.prisma.utilisateur.create({
        data: {
          id: id ? id : uuidv4(),
          name,
        },
      })
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          // The .code property can be accessed in a type-safe manner
          if (error.code === 'P2002') {
            throw new BadRequestException(`Un utilisateur d'id ${id} existe déjà en base`);
          }
        }
        throw error;
    }
    return response;
  }
}
