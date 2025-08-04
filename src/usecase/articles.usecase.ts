import { Injectable } from '@nestjs/common';

import { ArticleRepository } from '../../src/infrastructure/repository/article.repository';
import { PartenaireUsecase } from './partenaire.usecase';

@Injectable()
export class ArticlesUsecase {
  constructor(
    private articleRepository: ArticleRepository,
    private partenaireUsecase: PartenaireUsecase,
  ) {}

  // TODO: add an admin endpoint to update all articles
  public async updatesAllAidesCommunes(block_size = 100) {
    await this.partenaireUsecase.updateCodesFromPartenaireFor(
      this.articleRepository,
      block_size,
    );
  }
}
