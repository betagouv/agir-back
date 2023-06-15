import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Compteur, Prisma } from '@prisma/client';

@Injectable()
export class CompteurRepository {
  constructor(private prisma: PrismaService) {}

  async getById(id:string): Promise<Compteur | null>{
    return this.prisma.compteur.findUnique({
      where: {id}
    });
  }

  async list(): Promise<Compteur[] | null>{
    return this.prisma.compteur.findMany({});
  }

  async create(
    titre: string,
    valeur: number,
    utilisateurId: string,
    id?: string
  ): Promise<Compteur | null> {
    let response
    try {
      response = await this.prisma.compteur.create({
        data: {
          id: id ? id : uuidv4(),
          titre,
          valeur,
          utilisateurId
        },
      })
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new BadRequestException(`Un compteur d'id ${id} existe déjà en base`);
          }
          if (error.code === 'P2003') {
            throw new BadRequestException(`Aucun utilisateur d'id ${utilisateurId} n'existe en base`);
          }
        }
        throw error;
    }
    return response;
  }
}
