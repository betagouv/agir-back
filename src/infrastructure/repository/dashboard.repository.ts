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

  async updateQuizzArrays(dashboard:Dashboard){
    await this.prisma.dashboard.update({
      where: {id: dashboard.id},
      data: {
        todoQuizz: dashboard.todoQuizz,
        doneQuizz: dashboard.doneQuizz
      }
    });
  }
 }
