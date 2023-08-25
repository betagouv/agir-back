import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Article as ArticleDB } from '@prisma/client';

@Injectable()
export class ArticleRepository {
  constructor(private prisma: PrismaService) {}

  async getById(id: string): Promise<ArticleDB | null> {
    return this.prisma.article.findUnique({
      where: { id },
    });
  }
}
