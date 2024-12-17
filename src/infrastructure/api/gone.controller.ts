import { Controller, Get, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { ApplicationError } from '../applicationError';

@Controller()
@ApiBearerAuth()
@ApiTags('GONE APIs')
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
}
