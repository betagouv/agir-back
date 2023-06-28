import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Utilisateur, Prisma } from '@prisma/client';

@Injectable()
export class UtilisateurRepository {
  constructor(private prisma: PrismaService) {}

  async findUtilisateursByName(name: string): Promise<Utilisateur[] | null> {
    return this.prisma.utilisateur.findMany({
      where: {
        name,
      },
    });
  }
  async findUtilisateurById(id: string): Promise<Utilisateur | null> {
    return this.prisma.utilisateur.findUnique({
      where: {
        id,
      },
    });
  }

  async listUtilisateur(): Promise<Utilisateur[] | null> {
    return this.prisma.utilisateur.findMany({});
  }

  async createUtilisateur(name: string): Promise<Utilisateur | null> {
    return this.prisma.utilisateur.create({
      data: {
        id: uuidv4(),
        name,
      },
    });
  }
}
