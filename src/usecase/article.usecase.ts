import { Article as ArticleDB } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { ArticleRepository } from '../infrastructure/repository/article.repository';

@Injectable()
export class ArticleUsecase {
  constructor(private articleRepository: ArticleRepository) {}

  async getById(articleId: string): Promise<ArticleDB> {
    return this.articleRepository.getById(articleId);
  }
}
