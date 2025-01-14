import { Controller, Get, Request } from '@nestjs/common';
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

  /*
OK - /utilisateurs/{utilisateurId}/aides
OK - /utilisateur/{utilisateurId}/bilans/last
OK - /utilisateur/{utilisateurId}/bilans/last_v2
OK - /utilisateurs/{utilisateurId}/bilans/last_v2
OK - /utilisateurs/{utilisateurId}/defis
OK - /utilisateurs/{utilisateurId}/univers/{universId}/defis
OK - /utilisateurs/{utilisateurId}/thematiques/{thematique}/mission
- /utilisateurs/{utilisateurId}/thematiques/{thematique}/mission/terminer
- /utilisateurs/{utilisateurId}/enchainementQuestionsKYC/{enchainementId}
- /utilisateurs/{utilisateurId}/questionsKYC
- /utilisateurs/{utilisateurId}/questionsKYC/{questionId}
- /utilisateurs/{utilisateurId}/recommandations
- /utilisateurs/{utilisateurId}/recommandations_v2
- /utilisateurs/{utilisateurId}/recherche_services/{universId}
- /utilisateurs/{utilisateurId}/thematiques_recommandees
- /utilisateurs/{utilisateurId}/univers
- /utilisateurs/{utilisateurId}/univers/{univers}/thematiques


 recherche_services/${idService}/search => DEPRECATED => recherche_services/${idService}/search2
  - /utilisateurs/${utilisateurId}/thematiques/${thematiqueId}/defis => DEPRECATED => /utilisateurs/{userId}/defis_v2

  */
}
