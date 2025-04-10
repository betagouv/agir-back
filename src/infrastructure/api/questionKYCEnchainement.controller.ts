import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { QuestionKYCEnchainementUsecase } from '../../usecase/questionKYCEnchainement.usecase';
import { ApplicationError } from '../applicationError';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import {
  EnchainementKYCAPI,
  EnchainementKYCExclude,
} from './types/kyc/enchainementKYCAPI';
import { MosaicKYCAPI } from './types/kyc/mosaicKYCAPI';
import { QuestionKYCAPI } from './types/kyc/questionsKYCAPI';
import { QuestionKYCAPI_v2 } from './types/kyc/questionsKYCAPI_v2';
import { ReponseKYCAPI } from './types/kyc/reponseKYCAPI';
import { ReponseKYCMosaicAPI } from './types/kyc/reponseKYCMosaicAPI';

@Controller()
@ApiExtraModels(
  QuestionKYCAPI,
  MosaicKYCAPI,
  ReponseKYCMosaicAPI,
  ReponseKYCAPI,
)
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
  @ApiQuery({
    name: 'exclude',
    enum: EnchainementKYCExclude,
    required: false,
    isArray: true,
    description: `paramètres d'exclusion : repondu / non_eligible`,
  })
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: EnchainementKYCAPI })
  async getFirst(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('enchainementId') enchainementId: string,
    @Query('exclude') exclude: EnchainementKYCExclude,
  ): Promise<EnchainementKYCAPI> {
    this.checkCallerId(req, utilisateurId);

    const excludes = this.getStringListFromStringArrayAPIInput(exclude);
    let final_excludes: EnchainementKYCExclude[] = [];
    for (const one_exclude of excludes) {
      final_excludes.push(
        this.castExcludeEnchainementKYCOrException(one_exclude),
      );
    }

    const enchainement =
      await this.questionKYCEnchainementUsecase.getFirstOfEnchainementQuestionsWithExcludes(
        utilisateurId,
        enchainementId,
        final_excludes,
      );
    if (enchainement) {
      return EnchainementKYCAPI.mapToAPI(enchainement, final_excludes);
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
  @ApiQuery({
    name: 'exclude',
    enum: EnchainementKYCExclude,
    required: false,
    isArray: true,
    description: `paramètres d'exclusion : repondu / non_eligible`,
  })
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: EnchainementKYCAPI })
  async getNextEligible(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('enchainementId') enchainementId: string,
    @Param('kyc_code') kyc_code: string,
    @Query('exclude') exclude: EnchainementKYCExclude,
  ): Promise<EnchainementKYCAPI> {
    this.checkCallerId(req, utilisateurId);

    const excludes = this.getStringListFromStringArrayAPIInput(exclude);
    let final_excludes: EnchainementKYCExclude[] = [];
    for (const one_exclude of excludes) {
      final_excludes.push(
        this.castExcludeEnchainementKYCOrException(one_exclude),
      );
    }

    const enchainement =
      await this.questionKYCEnchainementUsecase.getNextWithExcludes(
        utilisateurId,
        enchainementId,
        kyc_code,
        final_excludes,
      );
    if (enchainement) {
      return EnchainementKYCAPI.mapToAPI(enchainement, final_excludes);
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
  @ApiQuery({
    name: 'exclude',
    enum: EnchainementKYCExclude,
    required: false,
    isArray: true,
    description: `paramètres d'exclusion : repondu / non_eligible`,
  })
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: EnchainementKYCAPI })
  async getpreviousEligible(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('enchainementId') enchainementId: string,
    @Param('kyc_code') kyc_code: string,
    @Query('exclude') exclude: EnchainementKYCExclude,
  ): Promise<EnchainementKYCAPI> {
    this.checkCallerId(req, utilisateurId);

    const excludes = this.getStringListFromStringArrayAPIInput(exclude);
    let final_excludes: EnchainementKYCExclude[] = [];
    for (const one_exclude of excludes) {
      final_excludes.push(
        this.castExcludeEnchainementKYCOrException(one_exclude),
      );
    }

    const enchainement =
      await this.questionKYCEnchainementUsecase.getPreviousWithExcludes(
        utilisateurId,
        enchainementId,
        kyc_code,
        final_excludes,
      );
    if (enchainement) {
      return EnchainementKYCAPI.mapToAPI(enchainement, final_excludes);
    } else {
      ApplicationError.throwQuestionNotFound();
    }
  }
}
