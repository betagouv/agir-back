import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Article } from '../../../src/domain/article';

@Injectable()
export class ArticleRepository {
  constructor(private prisma: PrismaService) {}

  async upsert(article: Article): Promise<void> {
    await this.prisma.article.upsert({
      where: { content_id: article.content_id },
      create: {
        ...article,
        created_at: undefined,
        updated_at: undefined,
      },
      update: {
        ...article,
        updated_at: undefined,
      },
    });
  }
}
