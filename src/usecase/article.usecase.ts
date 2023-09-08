import { Injectable } from '@nestjs/common';
import { Article } from '../../src/domain/article';
import { ArticleRepository } from '../infrastructure/repository/article.repository';

@Injectable()
export class ArticleUsecase {
  constructor(private articleRepository: ArticleRepository) {}

  async getById(articleId: string): Promise<Article> {
    return this.articleRepository.getById(articleId);
  }
}
