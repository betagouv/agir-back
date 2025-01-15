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
import { MissionAPI_v2 } from './types/mission/MissionAPI_v2';
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
    summary: `Retourne une liste de tuile de mission correspondant à la thématique demandée, ordonnée par reco, sauf les examens`,
  })
  async getTuilesMissions(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('code_thematique') code_thematique: string,
  ): Promise<TuileMissionAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const them = this.castThematiqueOrException(code_thematique);

    const result = await this.missionUsecase.getTuilesMissionsOfThematique(
      utilisateurId,
      them,
    );
    return result
      .filter((m) => !m.est_examen)
      .map((e) => TuileMissionAPI.mapToAPI(e));
  }

  @Get(
    'utilisateurs/:utilisateurId/thematiques/:code_thematique/tuiles_missions_v2',
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
    summary: `Retourne une liste de tuile de mission correspondant à la thématique demandée, ordonnée par reco, incluant les examens`,
  })
  async getTuilesMissions_v2(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('code_thematique') code_thematique: string,
  ): Promise<TuileMissionAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const them = this.castThematiqueOrException(code_thematique);

    const result = await this.missionUsecase.getTuilesMissionsOfThematique(
      utilisateurId,
      them,
    );
    return result.map((e) => TuileMissionAPI.mapToAPI(e));
  }

  @Get('utilisateurs/:utilisateurId/tuiles_missions')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: [TuileMissionAPI],
  })
  @ApiOperation({
    summary: `Retourne les missions recommandées pour la home (toute thématique confondue), sauf les examens`,
  })
  async getMissionsRecommandees(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<TuileMissionAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result =
      await this.missionUsecase.getTuilesMissionsRecommandeesToutesThematiques(
        utilisateurId,
      );
    return result
      .filter((m) => !m.est_examen)
      .map((e) => TuileMissionAPI.mapToAPI(e));
  }

  @Get('utilisateurs/:utilisateurId/tuiles_missions_v2')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: [TuileMissionAPI],
  })
  @ApiOperation({
    summary: `Retourne les missions recommandées pour la home (toute thématique confondue), avec des examens`,
  })
  async getMissionsRecommandees_v2(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<TuileMissionAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result =
      await this.missionUsecase.getTuilesMissionsRecommandeesToutesThematiques(
        utilisateurId,
      );
    return result.map((e) => TuileMissionAPI.mapToAPI(e));
  }

  @Get('utilisateurs/:utilisateurId/missions/:code_mission')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: MissionAPI_v2,
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
  ): Promise<MissionAPI_v2> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.missionUsecase.getMissionByCode(
      utilisateurId,
      code_mission,
    );
    return MissionAPI_v2.mapToAPI(result);
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
