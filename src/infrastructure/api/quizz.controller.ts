import {
  Body,
  Controller,
  Res,
  Param,
  Post,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { QuizzUsecase } from '../../usecase/quizz.usecase';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { BodyReponsesQuizz } from './types/reponsesQuizz';
import { QuizzAPI } from './types/quizzAPI';

@Controller()
@ApiTags('Quizz')
export class QuizzController {
  constructor(private readonly quizzUsecase: QuizzUsecase) {}

  @Get('quizz/:id')
  @ApiOkResponse({ type: QuizzAPI })
  async getById(@Param('id') id: string): Promise<QuizzAPI> {
    return this.quizzUsecase.getQuizzById(id);
  }
}
