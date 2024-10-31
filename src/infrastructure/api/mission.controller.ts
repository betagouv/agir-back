import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  Controller,
  Param,
  UseGuards,
  Request,
  Get,
  Post,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { MissionAPI } from './types/mission/MissionAPI';
import { MissionUsecase } from '../../../src/usecase/mission.usecase';
import { QuestionKYCAPI } from './types/kyc/questionsKYCAPI';
import { MosaicKYCAPI } from './types/kyc/mosaicKYCAPI';
import { TuileMissionAPI } from './types/univers/TuileMissionAPI';
import { Thematique } from '../../domain/contenu/thematique';
import { ApplicationError } from '../applicationError';
@ApiExtraModels(QuestionKYCAPI, MosaicKYCAPI)
@Controller()
@ApiBearerAuth()
@ApiTags('Mission')
export class MissionController extends GenericControler {
  constructor(private missionUsecase: MissionUsecase) {
    super();
  }

  // NEW NEW NEW
  @Get(
    'utilisateurs/:utilisateurId/thematiques/:code_thematique/tuiles_missions',
  )
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: [TuileMissionAPI],
  })
  @ApiParam({
    name: 'code_thematique',
    enum: Thematique,
    required: true,
    description: `la thematique des missions demandées`,
  })
  @ApiOperation({
    summary: `Retourne une liste de tuile de mission correspondant à la thématique demandée, ordonnée par reco`,
  })
  async getTuilesMissions(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('code_thematique') code_thematique: string,
  ): Promise<TuileMissionAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const them = Thematique[code_thematique];
    if (!them) {
      ApplicationError.throwThematiqueNotFound(code_thematique);
    }
    const result = await this.missionUsecase.getMissionsOfThematique(
      utilisateurId,
      them,
    );
    return result.map((e) => TuileMissionAPI.mapToAPI(e));
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
    deprecated: true,
    summary: `DEPRECATED : Retourne la mission de la thématique`,
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

  @Get('utilisateurs/:utilisateurId/missions/:code_mission')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: MissionAPI,
  })
  @ApiParam({
    name: 'code_mission',
    type: String,
    required: true,
    description: `Le code de la mission`,
  })
  @ApiParam({
    name: 'utilisateurId',
    type: String,
    required: true,
    description: `id de l'utilisateur`,
  })
  @ApiOperation({
    summary: `Retourne la mission de code donné`,
  })
  async getMissionByCode(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('code_mission') code_mission: string,
  ): Promise<MissionAPI> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.missionUsecase.getMissionByCode(
      utilisateurId,
      code_mission,
    );
    return MissionAPI.mapToAPI(result);
  }

  @Post('utilisateurs/:utilisateurId/thematiques/:thematique/mission/terminer')
  @UseGuards(AuthGuard)
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
    deprecated: true,
    summary: `DEPRECATED : Declare la mission de cette thematique comme terminée`,
  })
  async terminerMission(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('thematique') thematique: string,
  ) {
    this.checkCallerId(req, utilisateurId);
    await this.missionUsecase.terminerMission(utilisateurId, thematique);
  }

  @Post('utilisateurs/:utilisateurId/missions/:code_mission/terminer')
  @UseGuards(AuthGuard)
  @ApiParam({
    name: 'code_mission',
    type: String,
    required: true,
    description: `le code de la mission`,
  })
  @ApiParam({
    name: 'utilisateurId',
    type: String,
    required: true,
    description: `id de l'utilisateur`,
  })
  @ApiOperation({
    summary: `Declare la mission de code argument comme terminée`,
  })
  async terminerMissionByCode(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('code_mission') code_mission: string,
  ) {
    this.checkCallerId(req, utilisateurId);
    await this.missionUsecase.terminerMissionByCode(
      utilisateurId,
      code_mission,
    );
  }

  @Get('utilisateurs/:utilisateurId/thematiques/:thematique/kycs')
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
    deprecated: true,
    summary: `DEPRECATED : Liste l'ensemble des kycs associées à la thématique argument, avec leur état respectif, incluant des mosaics`,
  })
  async getMissionKYCs(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('thematique') thematique: string,
  ): Promise<(QuestionKYCAPI | MosaicKYCAPI)[]> {
    this.checkCallerId(req, utilisateurId);

    const all_kyc_and_mosaic =
      await this.missionUsecase.getMissionKYCsAndMosaics(
        utilisateurId,
        thematique,
      );

    return all_kyc_and_mosaic.map((k) => {
      if (k.kyc) {
        return QuestionKYCAPI.mapToAPI(k.kyc);
      } else {
        return MosaicKYCAPI.mapToAPI(k.mosaic);
      }
    });
  }

  @Get('utilisateurs/:utilisateurId/missions/:code_mission/kycs')
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
  @ApiParam({
    name: 'utilisateurId',
    type: String,
    required: true,
    description: `id de l'utilisateur`,
  })
  @ApiParam({
    name: 'code_mission',
    type: String,
    required: true,
    description: `Code de la mission`,
  })
  @ApiOperation({
    summary: `Liste l'ensemble des kycs associées à la mission de code argument, avec leur état respectif, incluant des mosaics`,
  })
  async getMissionKYCsByCodeMission(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('code_mission') code_mission: string,
  ): Promise<(QuestionKYCAPI | MosaicKYCAPI)[]> {
    this.checkCallerId(req, utilisateurId);

    const all_kyc_and_mosaic =
      await this.missionUsecase.getMissionKYCsAndMosaicsByCodeMission(
        utilisateurId,
        code_mission,
      );

    return all_kyc_and_mosaic.map((k) => {
      if (k.kyc) {
        return QuestionKYCAPI.mapToAPI(k.kyc);
      } else {
        return MosaicKYCAPI.mapToAPI(k.mosaic);
      }
    });
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
