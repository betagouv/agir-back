import { Controller, Get, Post, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { ApplicationError } from '../applicationError';

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

  /*
OK - /utilisateurs/{utilisateurId}/aides
OK - /utilisateur/{utilisateurId}/bilans/last
OK - /utilisateur/{utilisateurId}/bilans/last_v2
OK - /utilisateurs/{utilisateurId}/bilans/last_v2
OK - /utilisateurs/{utilisateurId}/defis
OK - /utilisateurs/{utilisateurId}/univers/{universId}/defis
OK - /utilisateurs/{utilisateurId}/thematiques/{thematique}/mission
OK - /utilisateurs/{utilisateurId}/thematiques/{thematique}/mission/terminer
OK - /utilisateurs/{utilisateurId}/enchainementQuestionsKYC/{enchainementId}
OK - /utilisateurs/{utilisateurId}/questionsKYC
OK - /utilisateurs/{utilisateurId}/questionsKYC/{questionId}
OK - /utilisateurs/{utilisateurId}/recommandations
- /utilisateurs/{utilisateurId}/recommandations_v2
- /utilisateurs/{utilisateurId}/recherche_services/{universId}
- /utilisateurs/{utilisateurId}/thematiques_recommandees
OK - /utilisateurs/{utilisateurId}/univers
- /utilisateurs/{utilisateurId}/univers/{univers}/thematiques


 recherche_services/${idService}/search => DEPRECATED => recherche_services/${idService}/search2
  - /utilisateurs/${utilisateurId}/thematiques/${thematiqueId}/defis => DEPRECATED => /utilisateurs/{userId}/defis_v2

  */
}
