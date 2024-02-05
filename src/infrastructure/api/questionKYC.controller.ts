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
  Response,
  Request,
  Get,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { QuestionNGCUsecase_deprecated } from '../../usecase/questionNGC.deprecated.usecase';
import { Question } from '../../domain/bilan/question';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { QuestionKYCUsecase } from '../../../src/usecase/questionKYC.usecase';
import { QuestionKYCAPI } from './types/kyc/questionsKYCAPI';
import { ApplicationError } from '../applicationError';
import { ReponseAPI } from './types/kyc/reponseAPI';
import { ControllerExceptionFilter } from './controllerException.filter';

@Controller()
@ApiBearerAuth()
@ApiTags('QuestionsKYC')
//@UseFilters(new ControllerExceptionFilter())
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
    @Response() res,
  ): Promise<QuestionKYCAPI> {
    this.checkCallerId(req, utilisateurId);
    await this.questionKYCUsecase.updateResponse(
      utilisateurId,
      questionId,
      body.reponse,
    );
    return res.status(HttpStatus.OK).json('OK').send();
  }
}
