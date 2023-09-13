import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { Badge } from '../../domain/badge/badge';

@Injectable()
export class BadgeRepository {
  constructor(private prisma: PrismaService) {}

  async delete(utilisateurId: string) {
    if (utilisateurId)
      await this.prisma.badge.deleteMany({ where: { utilisateurId } });
  }

  async createUniqueBadge(utilisateurId: string, badge: Badge) {
    try {
      await this.prisma.badge.create({
        data: {
          id: uuidv4(),
          type: badge.type,
          titre: badge.titre,
          utilisateurId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code !== 'P2002') {
          throw new InternalServerErrorException();
        }
      }
    }
  }
}
