
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Citoyen } from '@prisma/client';

@Injectable()
export class CitoyenRepository {
  constructor(private prisma: PrismaService) {}

  async findCitoyen(
    citoyenId: number
  ): Promise<Citoyen | null> {
    return this.prisma.citoyen.findUnique({
      where: {
        id: citoyenId,
      },
    });
  }

  async createCitoyen(
    name: string,
    conso: number
  ): Promise<Citoyen | null> {
    return this.prisma.citoyen.create({
      data: {
        name,
        conso,
      },
    })
  }


  
}
