import { Controller, Param, Get } from '@nestjs/common';
import { ArticleUsecase } from '../../usecase/article.usecase';
import { ApiTags } from '@nestjs/swagger';
import { Article } from '.prisma/client';

@Controller()
@ApiTags('Article')
export class ArticleController {
  constructor(private readonly articleUsecase: ArticleUsecase) {}

  @Get('articles/:id')
  async getById(@Param('id') id: string): Promise<Article> {
    return this.articleUsecase.getById(id);
  }
}
