import { Injectable } from '@nestjs/common';

import { ArticleRepository } from '../../src/infrastructure/repository/article.repository';
import { PartenaireUsecase } from './partenaire.usecase';

@Injectable()
export class ArticlesUsecase {
  constructor(
    private articleRepository: ArticleRepository,
    private partenaireUsecase: PartenaireUsecase,
  ) {}

  public async updateAllPartenairesCodes(block_size = 100) {
    await this.partenaireUsecase.updateCodesFromPartenaireFor(
      this.articleRepository,
      block_size,
    );
  }
}
