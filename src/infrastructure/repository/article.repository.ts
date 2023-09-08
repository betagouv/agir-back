import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Article as ArticleDB } from '@prisma/client';
import { Article } from '../../../src/domain/article';

@Injectable()
export class ArticleRepository {
  constructor(private prisma: PrismaService) {}

  async getById(id: string): Promise<Article | null> {
    return this.prisma.article.findUnique({
      where: { id },
    });
  }
}
