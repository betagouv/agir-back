import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
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
import { ReponseKYCAPI } from './types/kyc/reponseKYCAPI';
import { MosaicKYCAPI } from './types/kyc/mosaicKYCAPI';
import { ReponseKYCMosaicAPI } from './types/kyc/reponseKYCMosaicAPI';
import { MosaicKYC } from '../../domain/kyc/mosaicKYC';

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

  @Get('utilisateurs/:utilisateurId/questionsKYC')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    schema: {
      items: {
        allOf: [
          { $ref: getSchemaPath(QuestionKYCAPI) },
          { $ref: getSchemaPath(MosaicKYCAPI) },
        ],
      },
    },
  })
  @ApiOperation({
    summary: "Retourne l'ensemble des question (avec ou sans réponses)",
  })
  async getAll(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<(QuestionKYCAPI | MosaicKYCAPI)[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.questionKYCUsecase.getALL(utilisateurId);
    return result.map((k) => {
      if (k.kyc) {
        return QuestionKYCAPI.mapToAPI(k.kyc);
      } else {
        return MosaicKYCAPI.mapToAPI(k.mosaic);
      }
    });
  }

  @ApiOperation({
    summary:
      "Retourne une question d'id questionId avec sa réponse, reponse qui peut être null si l'utilsateur n'a pas répondu à la question encore",
  })
  @Get('utilisateurs/:utilisateurId/questionsKYC/:questionId')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(QuestionKYCAPI) },
        { $ref: getSchemaPath(MosaicKYCAPI) },
      ],
    },
  })
  async getQuestion(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('questionId') questionId: string,
  ): Promise<QuestionKYCAPI | MosaicKYCAPI> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.questionKYCUsecase.getQuestion(
      utilisateurId,
      questionId,
    );
    if (result.kyc) {
      return QuestionKYCAPI.mapToAPI(result.kyc);
    } else {
      return MosaicKYCAPI.mapToAPI(result.mosaic);
    }
  }
  @ApiOperation({
    summary: 'Retourne une liste de questions à enchainer',
  })
  @Get('utilisateurs/:utilisateurId/enchainementQuestionsKYC/:enchainementId')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    schema: {
      items: {
        allOf: [
          { $ref: getSchemaPath(QuestionKYCAPI) },
          { $ref: getSchemaPath(MosaicKYCAPI) },
        ],
      },
    },
  })
  async getEnchainementQuestions(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('enchainementId') enchainementId: string,
  ): Promise<(QuestionKYCAPI | MosaicKYCAPI)[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.questionKYCUsecase.getEnchainementQuestions(
      utilisateurId,
      enchainementId,
    );
    return result.liste_questions.map((q) => {
      if (q.kyc) {
        return QuestionKYCAPI.mapToAPI(q.kyc);
      } else {
        return MosaicKYCAPI.mapToAPI(q.mosaic);
      }
    });
  }

  @ApiOperation({
    summary: "Met à jour la réponse de la question d'id donné",
  })
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ReponseKYCMosaicAPI) },
        { $ref: getSchemaPath(ReponseKYCAPI) },
      ],
    },
  })
  @Put('utilisateurs/:utilisateurId/questionsKYC/:questionId')
  @UseGuards(AuthGuard)
  async updateResponse(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('questionId') questionId: string,
    @Body() body: ReponseKYCAPI | ReponseKYCMosaicAPI,
  ): Promise<void> {
    this.checkCallerId(req, utilisateurId);
    if (MosaicKYC.isMosaicID(questionId)) {
      await this.questionKYCUsecase.updateResponseMosaic(
        utilisateurId,
        questionId,
        (body as ReponseKYCMosaicAPI).reponse_mosaic,
      );
    } else {
      await this.questionKYCUsecase.updateResponseKYC(
        utilisateurId,
        questionId,
        (body as ReponseKYCAPI).reponse,
      );
    }
  }
}
