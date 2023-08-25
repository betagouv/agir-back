import { Controller, Param, Get } from '@nestjs/common';
import { ArticleUsecase } from '../../usecase/article.usecase';
import { ApiTags } from '@nestjs/swagger';
import { ArticleAPI } from './types/article';

@Controller()
@ApiTags('Article')
export class ArticleController {
  constructor(private readonly articleUsecase: ArticleUsecase) {}

  @Get('articles/:id')
  async getById(@Param('id') id: string): Promise<ArticleAPI> {
    let articleDB = await this.articleUsecase.getById(id);
    return {
      title: articleDB.titre,
      content: articleDB.contenu,
    };
  }
}
