import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { QuestionKYCEnchainementUsecase } from '../../usecase/questionKYCEnchainement.usecase';
import { ApplicationError } from '../applicationError';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { EnchainementKYCAPI } from './types/kyc/enchainementKYCAPI';
import { QuestionKYCAPI_v2 } from './types/kyc/questionsKYCAPI_v2';
import { ReponseKYCAPI } from './types/kyc/reponseKYCAPI';

@Controller()
@ApiExtraModels(ReponseKYCAPI)
@ApiBearerAuth()
@ApiTags('QuestionsKYC - Enchainements')
export class QuestionsKYCEnchainementController extends GenericControler {
  constructor(
    private readonly questionKYCEnchainementUsecase: QuestionKYCEnchainementUsecase,
  ) {
    super();
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
    const result =
      await this.questionKYCEnchainementUsecase.getEnchainementQuestions(
        utilisateurId,
        enchainementId,
      );
    return result.map((q) => QuestionKYCAPI_v2.mapToAPI(q));
  }

  @ApiOperation({
    summary: 'Retourne le premier élément de cet enchainement de questions',
  })
  @Get(
    'utilisateurs/:utilisateurId/enchainementQuestionsKYC_v2/:enchainementId/first',
  )
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: EnchainementKYCAPI })
  async getFirst(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('enchainementId') enchainementId: string,
  ): Promise<EnchainementKYCAPI> {
    this.checkCallerId(req, utilisateurId);

    const enchainement = await this.questionKYCEnchainementUsecase.getFirst(
      utilisateurId,
      enchainementId,
    );
    if (enchainement) {
      return EnchainementKYCAPI.mapToAPI(enchainement);
    } else {
      ApplicationError.throwQuestionNotFound();
    }
  }

  @ApiOperation({
    summary:
      'Retourne le prochain élément eligible fonction de la question courante',
  })
  @Get(
    'utilisateurs/:utilisateurId/enchainementQuestionsKYC_v2/:enchainementId/following/:kyc_code',
  )
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: EnchainementKYCAPI })
  async getNextEligible(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('enchainementId') enchainementId: string,
    @Param('kyc_code') kyc_code: string,
  ): Promise<EnchainementKYCAPI> {
    this.checkCallerId(req, utilisateurId);

    const enchainement = await this.questionKYCEnchainementUsecase.getNext(
      utilisateurId,
      enchainementId,
      kyc_code,
    );
    if (enchainement) {
      return EnchainementKYCAPI.mapToAPI(enchainement);
    } else {
      ApplicationError.throwQuestionNotFound();
    }
  }

  @ApiOperation({
    summary:
      'Retourne le précédent élément eligible fonction de la question courante',
  })
  @Get(
    'utilisateurs/:utilisateurId/enchainementQuestionsKYC_v2/:enchainementId/preceding/:kyc_code',
  )
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: EnchainementKYCAPI })
  async getpreviousEligible(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('enchainementId') enchainementId: string,
    @Param('kyc_code') kyc_code: string,
  ): Promise<EnchainementKYCAPI> {
    this.checkCallerId(req, utilisateurId);

    const enchainement = await this.questionKYCEnchainementUsecase.getPrevious(
      utilisateurId,
      enchainementId,
      kyc_code,
    );
    if (enchainement) {
      return EnchainementKYCAPI.mapToAPI(enchainement);
    } else {
      ApplicationError.throwQuestionNotFound();
    }
  }
}
