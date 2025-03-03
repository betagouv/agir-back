import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { QuestionKYCUsecase } from '../../../src/usecase/questionKYC.usecase';
import { MosaicKYC_CATALOGUE } from '../../domain/kyc/mosaicKYC';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { MosaicKYCAPI } from './types/kyc/mosaicKYCAPI';
import { QuestionKYCAPI } from './types/kyc/questionsKYCAPI';
import { QuestionKYCAPI_v2 } from './types/kyc/questionsKYCAPI_v2';
import { ReponseKYCAPI } from './types/kyc/reponseKYCAPI';
import { ReponseKYCAPI_v2 } from './types/kyc/reponseKYCAPI_v2';
import { ReponseKYCMosaicAPI } from './types/kyc/reponseKYCMosaicAPI';

@Controller()
@ApiExtraModels(
  QuestionKYCAPI,
  MosaicKYCAPI,
  ReponseKYCMosaicAPI,
  ReponseKYCAPI,
)
@ApiBearerAuth()
@ApiTags('QuestionsKYC')
export class QuestionsKYCController extends GenericControler {
  constructor(private readonly questionKYCUsecase: QuestionKYCUsecase) {
    super();
  }

  @Get('utilisateurs/:utilisateurId/questionsKYC_v2')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: [QuestionKYCAPI_v2],
  })
  @ApiOperation({
    summary: "Retourne l'ensemble des question (avec ou sans réponses)",
  })
  async getAll_v2(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<QuestionKYCAPI_v2[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.questionKYCUsecase.getALL(utilisateurId);
    return result.map((k) => QuestionKYCAPI_v2.mapToAPI(k));
  }

  @ApiOperation({
    summary:
      "Retourne une question d'id questionId avec sa réponse, reponse qui peut être null si l'utilsateur n'a pas répondu à la question encore",
  })
  @Get('utilisateurs/:utilisateurId/questionsKYC_v2/:questionId')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: QuestionKYCAPI_v2,
  })
  async getQuestion_v2(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('questionId') questionId: string,
  ): Promise<QuestionKYCAPI_v2> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.questionKYCUsecase.getQuestion(
      utilisateurId,
      questionId,
    );
    return QuestionKYCAPI_v2.mapToAPI(result);
  }

  @ApiOperation({
    summary: 'Retourne une liste de questions à enchainer',
  })
  @Get(
    'utilisateurs/:utilisateurId/enchainementQuestionsKYC_v2/:enchainementId',
  )
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: [QuestionKYCAPI_v2] })
  async getEnchainementQuestions_v2(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('enchainementId') enchainementId: string,
  ): Promise<QuestionKYCAPI_v2[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.questionKYCUsecase.getEnchainementQuestions(
      utilisateurId,
      enchainementId,
    );
    return result.map((q) => QuestionKYCAPI_v2.mapToAPI(q));
  }

  @ApiOperation({
    summary: "Met à jour la réponse de la question d'id donné",
  })
  @ApiBody({
    type: [ReponseKYCAPI_v2],
  })
  @Put('utilisateurs/:utilisateurId/questionsKYC_v2/:questionId')
  @UseGuards(AuthGuard)
  async updateResponse_v2(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('questionId') questionId: string,
    @Body() body: ReponseKYCAPI_v2[],
  ): Promise<void> {
    this.checkCallerId(req, utilisateurId);
    if (MosaicKYC_CATALOGUE.isMosaicID(questionId)) {
      await this.questionKYCUsecase.updateResponseMosaic_v2(
        utilisateurId,
        questionId,
        body,
      );
    } else {
      await this.questionKYCUsecase.updateResponseKYC_v2(
        utilisateurId,
        questionId,
        body,
      );
    }
  }
}
