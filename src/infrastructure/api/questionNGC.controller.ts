import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { QuestionNGCUsecase } from '../../usecase/questionNGC.usecase';
import { QuestionNGCAPI } from './types/ngc/questionNGCAPI';
import { Question } from '../../../src/domain/bilan/question';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';

@Controller()
@ApiTags('QuestionsNGC')
@ApiBearerAuth()
export class QuestionsNGCController extends GenericControler {
  constructor(private readonly questionNGCUsecase: QuestionNGCUsecase) {
    super();
  }

  @Put('utilisateurs/:utilisateurId/questionsNGC')
  @UseGuards(AuthGuard)
  async createOrUpdate(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Body() body: QuestionNGCAPI,
  ): Promise<Question> {
    this.checkCallerId(req, utilisateurId);
    return this.questionNGCUsecase.createOrUpdateQuestion(
      utilisateurId,
      body.key,
      body.value,
    );
  }
}
