import { Controller, Param, Get } from '@nestjs/common';
import { ArticleUsecase } from '../../usecase/article.usecase';
import { ApiTags } from '@nestjs/swagger';
import { ArticleAPI } from './types/articleAPI';

@Controller()
@ApiTags('Article')
export class ArticleController {
  constructor(private readonly articleUsecase: ArticleUsecase) {}

  @Get('articles/:id')
  async getById(@Param('id') id: string): Promise<ArticleAPI> {
    return this.articleUsecase.getById(id);
  }
}
