import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Badge } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BadgeRepository {
  constructor(private prisma: PrismaService) {}
}
