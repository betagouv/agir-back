import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
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
  Patch,
  Post,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { MissionAPI } from './types/mission/MissionAPI';
import { MissionUsecase } from '../../../src/usecase/mission.usecase';
import { QuestionKYCAPI } from './types/kyc/questionsKYCAPI';
import { QuestionKYCUsecase } from '../../../src/usecase/questionKYC.usecase';

@Controller()
@ApiBearerAuth()
@ApiTags('Mission')
export class MissionController extends GenericControler {
  constructor(
    private missionUsecase: MissionUsecase,
    private questionKYCUsecase: QuestionKYCUsecase,
  ) {
    super();
  }

  @Get('utilisateurs/:utilisateurId/thematiques/:thematique/mission')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: MissionAPI,
  })
  @ApiParam({
    name: 'thematique',
    type: String,
    enumName: 'thematique',
    required: true,
    description: `la thématique`,
  })
  @ApiParam({
    name: 'utilisateurId',
    type: String,
    required: true,
    description: `id de l'utilisateur`,
  })
  @ApiOperation({
    summary: `Retourne la mission de la thématique`,
  })
  async getMission(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('thematique') thematique: string,
  ): Promise<MissionAPI> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.missionUsecase.getMissionOfThematique(
      utilisateurId,
      thematique,
    );
    return MissionAPI.mapToAPI(result);
  }

  @Get('utilisateurs/:utilisateurId/thematiques/:thematique/next_kyc')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: QuestionKYCAPI,
  })
  @ApiParam({
    name: 'utilisateurId',
    type: String,
    required: true,
    description: `id de l'utilisateur`,
  })
  @ApiParam({
    name: 'thematique',
    type: String,
    required: true,
    description: `Thematique de la mission`,
  })
  @ApiOperation({
    summary: `Retourne la prochaine question de la mission de thématique argumnt si elle existe, 404 sinon`,
  })
  async getMissionNexKYC(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('thematique') thematique: string,
  ): Promise<QuestionKYCAPI> {
    this.checkCallerId(req, utilisateurId);

    const next_kyc_id = await this.missionUsecase.getMissionNextKycID(
      utilisateurId,
      thematique,
    );

    const kyc = await this.questionKYCUsecase.getQuestion(
      utilisateurId,
      next_kyc_id,
    );
    return QuestionKYCAPI.mapToAPI(kyc);
  }

  @Get('utilisateurs/:utilisateurId/thematiques/:thematique/kycs')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: [QuestionKYCAPI],
  })
  @ApiParam({
    name: 'utilisateurId',
    type: String,
    required: true,
    description: `id de l'utilisateur`,
  })
  @ApiParam({
    name: 'thematique',
    type: String,
    required: true,
    description: `Thematique de la mission`,
  })
  @ApiOperation({
    summary: `Liste l'ensemble des kycs associées à la thématique argument, avec leur état respectif`,
  })
  async getMissionKYCs(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('thematique') thematique: string,
  ): Promise<QuestionKYCAPI[]> {
    this.checkCallerId(req, utilisateurId);

    const all_kyc = await this.missionUsecase.getMissionKYCs(
      utilisateurId,
      thematique,
    );

    return all_kyc.map((k) => QuestionKYCAPI.mapToAPI(k));
  }

  @ApiOperation({
    summary:
      "Empoche les points d'un objectif de mission terminé pour l'utilisateur",
  })
  @Post('utilisateurs/:utilisateurId/objectifs/:objectifId/gagner_points')
  @UseGuards(AuthGuard)
  async gagnerPoints(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('objectifId') objectifId: string,
  ) {
    this.checkCallerId(req, utilisateurId);

    await this.missionUsecase.gagnerPointsDeObjectif(utilisateurId, objectifId);
  }
}
