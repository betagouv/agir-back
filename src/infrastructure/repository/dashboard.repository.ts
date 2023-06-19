import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Dashboard } from '@prisma/client';

@Injectable()
export class DashboardRepository {
  constructor(private prisma: PrismaService) {}

  async getByUtilisateurId(utilisateurId: string): Promise<Dashboard | null>{
    return this.prisma.dashboard.findUnique(
      {
        where: {utilisateurId},
        include: {
          compteurs: true,
          badges: true
        }
      }
    );
  }
}
