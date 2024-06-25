import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Param, UseGuards, Request, Get } from '@nestjs/common';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { UniversAPI } from './types/univers/UniversAPI';
import { UniversUsecase } from '../../../src/usecase/univers.usecase';
import { ThematiqueUniversAPI } from './types/univers/ThematiqueUniversAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Univers')
export class UniversController extends GenericControler {
  constructor(private universUsecase: UniversUsecase) {
    super();
  }

  @Get('utilisateurs/:utilisateurId/univers')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: [UniversAPI],
  })
  @ApiOperation({
    summary: `Retourne les univers auquels peut accéder l'utilisateur`,
  })
  async getUnivers(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<UniversAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.universUsecase.getALL(utilisateurId);
    return result.map((e) => UniversAPI.mapToAPI(e));
  }

  @Get('utilisateurs/:utilisateurId/univers/:univers/thematiques')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: [ThematiqueUniversAPI],
  })
  @ApiParam({
    name: 'univers',
    type: String,
    enumName: 'univers',
    required: true,
    description: `l'univers demandé`,
  })
  @ApiOperation({
    summary: `Retourne les thematiques de d'un univers particulier d'un utilisateur donné`,
  })
  async getUniversThematiques(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('univers') univers: string,
  ): Promise<ThematiqueUniversAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.universUsecase.getThematiquesOfUnivers(
      utilisateurId,
      univers,
    );
    return result.map((e) => ThematiqueUniversAPI.mapToAPI(e));
  }
}
