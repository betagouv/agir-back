import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { RecommandationAPI } from './types/contenu/recommandationAPI';
import { RecommandationUsecase } from '../../../src/usecase/recommandation.usecase';

@Controller()
@ApiBearerAuth()
@ApiTags('Recommandation')
export class RecommandationsController extends GenericControler {
  constructor(private readonly recommandationUsecase: RecommandationUsecase) {
    super();
  }

  @Get('utilisateurs/:utilisateurId/recommandations_v2')
  @ApiOkResponse({ type: [RecommandationAPI] })
  @UseGuards(AuthGuard)
  @ApiQuery({
    name: 'univers',
    type: String,
    required: false,
    description: `filtrage par thematique, par exemple 'alimentation'`,
  })
  @ApiOperation({
    deprecated: true,
    summary:
      "DEPRECATED : Liste les recommendations personnalisées de l'utilisateur, sans défis",
  })
  async getUserRecommandationV2(
    @Request() req,
    @Query('univers') univers: string,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<RecommandationAPI[]> {
    this.checkCallerId(req, utilisateurId);

    const them = univers ? this.castThematiqueOrException(univers) : undefined;
    const list = await this.recommandationUsecase.listRecommandationsV2(
      utilisateurId,
      them,
    );
    return list.map((reco) => RecommandationAPI.mapToAPI(reco));
  }

  @Get('utilisateurs/:utilisateurId/thematiques/:thematique/recommandations')
  @ApiOkResponse({ type: [RecommandationAPI] })
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary:
      "Liste les recommendations personnalisées de l'utilisateur par thématique",
  })
  async getUserRecommandationThematique(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('thematique') thematique: string,
  ): Promise<RecommandationAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const them = this.castThematiqueOrException(thematique);

    const list = await this.recommandationUsecase.listRecommandationsV2(
      utilisateurId,
      them,
    );
    return list.map((reco) => RecommandationAPI.mapToAPI(reco));
  }

  @Get('utilisateurs/:utilisateurId/recommandations_v3')
  @ApiOkResponse({ type: [RecommandationAPI] })
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: "Liste les recommendations personnalisées de l'utilisateur",
  })
  async getUserRecommandationV3(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<RecommandationAPI[]> {
    this.checkCallerId(req, utilisateurId);

    const list = await this.recommandationUsecase.listRecommandationsV2(
      utilisateurId,
    );
    return list.map((reco) => RecommandationAPI.mapToAPI(reco));
  }
}
