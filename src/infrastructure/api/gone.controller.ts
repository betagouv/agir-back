import { Controller, Get, Post, Put, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApplicationError } from '../applicationError';
import { GenericControler } from './genericControler';

@Controller()
@ApiBearerAuth()
@ApiTags('Z - GONE APIs')
export class GoneController extends GenericControler {
  @Get('utilisateurs/:utilisateurId/aides')
  @ApiOperation({
    summary: `DEPRECATED : NEW => utilisateurs/:utilisateurId/aides_v2`,
  })
  async getCatalogueAides(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Get('utilisateur/:utilisateurId/bilans/last')
  @ApiOperation({
    summary: 'DEPRECATED : NEW  => utilisateurs/:utilisateurId/bilans/last_v3',
  })
  async getBilan_deprecated(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @ApiOperation({
    summary: 'DEPRECATED : NEW  => utilisateurs/:utilisateurId/bilans/last_v3',
  })
  @Get('utilisateur/:utilisateurId/bilans/last_v2')
  async getBilan_V2_deprecated(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Get('utilisateurs/:utilisateurId/bilans/last_v2')
  @ApiOperation({
    summary: 'DEPRECATED : NEW  => utilisateurs/:utilisateurId/bilans/last_v3',
  })
  async getBilan_V2(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Get('utilisateurs/:utilisateurId/defis')
  @ApiOperation({
    summary: 'DEPRECATED : NEW => utilisateurs/:utilisateurId/defis_v2',
  })
  async getAllUserDefi(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Get('utilisateurs/:utilisateurId/univers/:universId/defis')
  @ApiOperation({
    summary: 'DEPRECATED : NEW => utilisateurs/:utilisateurId/defis_v2',
  })
  async getAllUserDefiInUnivers(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Get('utilisateurs/:utilisateurId/thematiques/:thematique/mission')
  @ApiOperation({
    summary: `DEPRECATED : NEW => GET utilisateurs/:utilisateurId/missions/:code_mission`,
  })
  async getMission(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Post('utilisateurs/:utilisateurId/thematiques/:thematique/mission/terminer')
  @ApiOperation({
    summary: `DEPRECATED : NEW => utilisateurs/:utilisateurId/missions/:code_mission/terminer`,
  })
  async terminerMission(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @ApiOperation({
    summary:
      'DEPRECATED : NEW => utilisateurs/:utilisateurId/enchainementQuestionsKYC_v2/:enchainementId',
  })
  @Get('utilisateurs/:utilisateurId/enchainementQuestionsKYC/:enchainementId')
  async getEnchainementQuestions(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Get('utilisateurs/:utilisateurId/questionsKYC')
  @ApiOperation({
    summary: 'DEPRECATED : NEW => utilisateurs/:utilisateurId/questionsKYC_v2',
  })
  async getAll(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @ApiOperation({
    summary:
      'DEPRECATED : NEW => utilisateurs/:utilisateurId/questionsKYC_v2/:questionId',
  })
  @Get('utilisateurs/:utilisateurId/questionsKYC/:questionId')
  async getQuestion(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Get('utilisateurs/:utilisateurId/recommandations')
  @ApiOperation({
    summary:
      'DEPRECATED : NEW => utilisateurs/:utilisateurId/recommandations_v3',
  })
  async getUserRecommandation(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Get('utilisateurs/:utilisateurId/univers')
  @ApiOperation({
    summary: `DEPRECATED : obsolète`,
  })
  async getUnivers(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Get('utilisateurs/:utilisateurId/univers/:univers/thematiques')
  @ApiOperation({
    summary: `DEPRECATED : NEW => utilisateurs/:utilisateurId/thematiques/:code_thematique/tuiles_missions`,
  })
  async getUniversThematiques(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Get('utilisateurs/:utilisateurId/thematiques_recommandees')
  @ApiOperation({
    summary: `DEPRECATED : obsolète`,
  })
  async getThematiquesRecommandees(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Post('utilisateurs/:utilisateurId/recherche_services/:serviceId/search')
  @ApiOperation({
    summary: `DEPRECATED : NEW  => utilisateurs/:utilisateurId/recherche_services/:serviceId/search2`,
  })
  async recherche(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Get('utilisateurs/:utilisateurId/thematiques/:code_thematique/defis')
  @ApiOperation({
    summary: 'DEPRECATED : NEW => utilisateurs/:utilisateurId/defis_v2',
  })
  async getAllUserDefisByThematique(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Get('utilisateurs/:utilisateurId/recommandations_v2')
  @ApiOperation({
    summary: 'DEPRECATED : NEW  => recommandations_v3',
  })
  async getUserRecommandationV2(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Get('utilisateurs/:utilisateurId/recherche_services/:universId')
  @ApiOperation({
    summary: `DEPRECATED : NEW  => utilisateurs/:utilisateurId/thematiques/:code_thematique/recherche_services`,
  })
  async getListeServices_deprecated(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @ApiOperation({
    summary:
      'DEPRECATED : NEW => utilisateurs/:utilisateurId/questionsKYC_v2/:questionId',
  })
  @Put('utilisateurs/:utilisateurId/questionsKYC/:questionId')
  async updateResponse(@Request() req): Promise<void> {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Get('utilisateurs/:utilisateurId/tuiles_missions_v2')
  @ApiOperation({
    summary: `Plus de missions sur le service V2`,
  })
  async getMissionsRecommandees_v2(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Get('utilisateurs/:utilisateurId/tuiles_missions')
  @ApiOperation({
    summary: `Plus de missions sur le service V2`,
  })
  async getMissionsRecommandees(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Get(
    'utilisateurs/:utilisateurId/thematiques/:code_thematique/tuiles_missions_v2',
  )
  @ApiOperation({
    summary: `Plus de missions sur le service V2`,
  })
  async getTuilesMissions_v2(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Get(
    'utilisateurs/:utilisateurId/thematiques/:code_thematique/tuiles_missions',
  )
  @ApiOperation({
    summary: `Plus de missions sur le service V2`,
  })
  async getTuilesMissions(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Get('utilisateurs/:utilisateurId/missions/:code_mission')
  @ApiOperation({
    summary: `Plus de missions sur le service V2`,
  })
  async getMissionByCode(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @Post('utilisateurs/:utilisateurId/missions/:code_mission/terminer')
  @ApiOperation({
    summary: `Plus de missions sur le service V2`,
  })
  async terminerMissionByCode(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }

  @ApiOperation({
    summary: 'Plus de missions sur le service V2',
  })
  @Post('utilisateurs/:utilisateurId/objectifs/:objectifId/gagner_points')
  async gagnerPoints(@Request() req) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
  }
}
