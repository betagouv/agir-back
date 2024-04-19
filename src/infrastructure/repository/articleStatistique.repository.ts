import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ArticleStatistiqueRepository {
  constructor(private prisma: PrismaService) {}

  async upsertStatistiquesDUnArticle(articleId: string, rating: number) {
    await this.prisma.articleStatistique.upsert({
      where: { articleId },
      create: {
        articleId,
        rating,
      },
      update: {
        rating,
      },
    });
  }
}
