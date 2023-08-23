import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Utilisateur as UtilisateurDB, Prisma } from '@prisma/client';
import { Utilisateur } from '../../../src/domain/utilisateur';

@Injectable()
export class UtilisateurRepository {
  constructor(private prisma: PrismaService) {}

  async findUtilisateursByName(name: string): Promise<UtilisateurDB[] | null> {
    return this.prisma.utilisateur.findMany({
      where: {
        name,
      },
      orderBy: [
        {
          created_at: 'desc',
        },
      ],
      include: {
        badges: true,
      },
    });
  }
  async findUtilisateurById(id: string): Promise<UtilisateurDB | null> {
    return this.prisma.utilisateur.findUnique({
      where: {
        id,
      },
      include: {
        badges: true,
      },
    });
  }
  async findUtilisateurByEmail(email: string): Promise<UtilisateurDB | null> {
    return this.prisma.utilisateur.findUnique({
      where: {
        email,
      },
    });
  }

  async listUtilisateur(): Promise<UtilisateurDB[] | null> {
    return this.prisma.utilisateur.findMany({
      orderBy: [
        {
          created_at: 'desc',
        },
      ],
    });
  }

  async createUtilisateurByName(name: string): Promise<UtilisateurDB | null> {
    return this.prisma.utilisateur.create({
      data: {
        id: uuidv4(),
        name,
      },
    });
  }
  async createUtilisateur(
    utilisateur: Utilisateur,
  ): Promise<UtilisateurDB | null> {
    return this.prisma.utilisateur.create({
      data: {
        id: uuidv4(),
        name: utilisateur.name,
        email: utilisateur.email,
        quizzLevels: utilisateur.quizzLevels.convertToKeyedObject(),
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
