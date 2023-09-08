import { ApiTags } from '@nestjs/swagger';
import { Controller, Put, Param, Body } from '@nestjs/common';
import { QuestionNGCUsecase } from '../../usecase/questionNGC.usecase';
import { QuestionNGCAPI } from './types/questionNGCAPI';
import { Question } from '../../../src/domain/bilan/question';

@Controller()
@ApiTags('QuestionsNGC')
export class QuestionsNGCController {
  constructor(private readonly questionNGCUsecase: QuestionNGCUsecase) {}

  @Put('utilisateurs/:utilisateurId/questionsNGC')
  async createOrUpdate(
    @Param('utilisateurId') utilisateurId: string,
    @Body() body: QuestionNGCAPI,
  ): Promise<Question> {
    return this.questionNGCUsecase.createOrUpdateQuestion(
      utilisateurId,
      body.key,
      body.value,
    );
  }
}
