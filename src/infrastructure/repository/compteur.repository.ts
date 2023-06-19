import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Compteur, Prisma } from '@prisma/client';

@Injectable()
export class CompteurRepository {
  constructor(private prisma: PrismaService) {}

  async list(): Promise<Compteur[] | null>{
    return this.prisma.compteur.findMany({});
  }
}
