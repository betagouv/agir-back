import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { QuestionKYCUsecase } from '../../../src/usecase/questionKYC.usecase';
import { QuestionKYCAPI } from './types/kyc/questionsKYCAPI';
import { ReponseAPI } from './types/kyc/reponseAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('QuestionsKYC')
export class QuestionsKYCController extends GenericControler {
  constructor(private readonly questionKYCUsecase: QuestionKYCUsecase) {
    super();
  }

  @Get('utilisateurs/:utilisateurId/questionsKYC')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: [QuestionKYCAPI],
  })
  @ApiOperation({
    summary: "Retourne l'ensemble des question (avec ou sans réponses)",
  })
  async getAll(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<QuestionKYCAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.questionKYCUsecase.getALL(utilisateurId);
    return result.map((element) => QuestionKYCAPI.mapToAPI(element));
  }

  @ApiOperation({
    summary:
      "Retourne une question d'id questionId avec sa réponse, reponse qui peut être null si l'utilsateur n'a pas répondu à la question encore",
  })
  @Get('utilisateurs/:utilisateurId/questionsKYC/:questionId')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: QuestionKYCAPI,
  })
  async getQuestion(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('questionId') questionId: string,
  ): Promise<QuestionKYCAPI> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.questionKYCUsecase.getQuestion(
      utilisateurId,
      questionId,
    );
    return QuestionKYCAPI.mapToAPI(result);
  }

  @ApiOperation({
    summary: "Met à jour la réponse de la question d'id donné",
  })
  @ApiBody({
    type: ReponseAPI,
  })
  @Put('utilisateurs/:utilisateurId/questionsKYC/:questionId')
  @UseGuards(AuthGuard)
  async updateResponse(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('questionId') questionId: string,
    @Body() body: ReponseAPI,
  ): Promise<string> {
    this.checkCallerId(req, utilisateurId);
    await this.questionKYCUsecase.updateResponse(
      utilisateurId,
      questionId,
      body.reponse,
    );
    return 'OK';
  }
}
