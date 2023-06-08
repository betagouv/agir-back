
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Citoyen } from '@prisma/client';

@Injectable()
export class CitoyenService {
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
    name: string
  ): Promise<Citoyen | null> {
    return this.prisma.citoyen.create({
      data: {
        name,
      },
    })
  }


  
}
