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
import { ThematiqueUsecase } from '../../usecase/thematique.usecase';
import { ThematiqueUniversAPI } from './types/univers/ThematiqueUniversAPI';
import { ApplicationError } from '../applicationError';

@Controller()
@ApiBearerAuth()
@ApiTags('Univers')
export class UniversController extends GenericControler {
  constructor(private universUsecase: ThematiqueUsecase) {
    super();
  }

  @Get('utilisateurs/:utilisateurId/univers')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: [UniversAPI],
  })
  @ApiOperation({
    deprecated: true,
    summary: `DEPRECATED : Retourne les univers auquels peut accéder l'utilisateur`,
  })
  async getUnivers(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ) {
    ApplicationError.throwThatURLIsGone(this.getURLFromRequest(req));
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
    deprecated: true,
    summary: `DEPRECATED : Retourne les thematiques de d'un univers particulier d'un utilisateur donné`,
  })
  async getUniversThematiques(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('univers') univers: string,
  ): Promise<ThematiqueUniversAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.universUsecase.getMissionsOfThematique(
      utilisateurId,
      univers,
    );
    return result.map((e) => ThematiqueUniversAPI.mapToAPI(e));
  }

  @Get('utilisateurs/:utilisateurId/thematiques_recommandees')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: [ThematiqueUniversAPI],
  })
  @ApiOperation({
    deprecated: true,
    summary: `DEPRECATED : Retourne les thematiques recommandées pour la home`,
  })
  async getThematiquesRecommandees(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<ThematiqueUniversAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.universUsecase.getThematiquesRecommandees(
      utilisateurId,
    );
    return result.map((e) => ThematiqueUniversAPI.mapToAPI(e));
  }
}
