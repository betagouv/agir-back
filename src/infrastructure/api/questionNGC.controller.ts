import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Controller, Put, Param, Body } from '@nestjs/common';
import { QuestionNGCUsecase } from '../../usecase/questionNGC.usecase';
import { QuestionNGC as QuestionNGCDB } from '.prisma/client';
import { QuestionNGC } from './types/questionNGC';

@Controller()
@ApiTags('QuestionsNGC')
export class QuestionsNGCController {
  constructor(private readonly questionNGCUsecase: QuestionNGCUsecase) {}

  @Put('utilisateurs/:utilisateurId/questionsNGC')
  async createOrUpdate(
    @Param('utilisateurId') utilisateurId: string,
    @Body() body: QuestionNGC,
  ): Promise<QuestionNGCDB> {
    return this.questionNGCUsecase.createOrUpdateQuestion(
      utilisateurId,
      body.key,
      body.value,
    );
  }
}
