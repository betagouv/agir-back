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
      orderBy: [
        {
          created_at: 'desc',
        },
      ],
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
    return this.prisma.utilisateur.findMany({
      orderBy: [
        {
          created_at: 'desc',
        },
      ],
    });
  }

  async createUtilisateur(name: string): Promise<Utilisateur | null> {
    return this.prisma.utilisateur.create({
      data: {
        id: uuidv4(),
        name,
      },
    });
  }

  async addPointsToUtilisateur(utilisateurId: string, points: number) {
    await this.prisma.utilisateur.update({
      where: {
        id: utilisateurId,
      },
      data: {
        points: {
          increment: points,
        },
      },
    });
  }
}
