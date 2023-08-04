import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Badge, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { BadgeTypeEnum } from '../../domain/badgeType';

@Injectable()
export class BadgeRepository {
  constructor(private prisma: PrismaService) {}

  async createUniqueBadge(utilisateurId: string, badge: BadgeTypeEnum) {
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
