import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Badge } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BadgeRepository {
  constructor(private prisma: PrismaService) {}

  async createBadgeForDashboard(titre:string, dashboardId:string): Promise<Badge | null>{
    return this.prisma.badge.create({
      data: {
        id: uuidv4(),
        date: new Date(),
        titre,
        dashboardId
      }
    });
  }
 }
