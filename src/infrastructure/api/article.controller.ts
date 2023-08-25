import {
  Body,
  Controller,
  Res,
  Param,
  Post,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ArticleUsecase } from '../../usecase/article.usecase';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { BodyReponsesQuizz } from './types/reponsesQuizz';
import { Article as ArticleDB } from '.prisma/client';

@Controller()
@ApiTags('Article')
export class ArticleController {
  constructor(private readonly articleUsecase: ArticleUsecase) {}

  @Get('articles/:id')
  async getById(@Param('id') id: string): Promise<ArticleDB> {
    return this.articleUsecase.getById(id);
  }
}
