import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RecommandationUsecase } from '../../../src/usecase/recommandation.usecase';
import { ContentType } from '../../domain/contenu/contentType';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { RecommandationAPI } from './types/contenu/recommandationAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Recommandation')
export class RecommandationsController extends GenericControler {
  constructor(private readonly recommandationUsecase: RecommandationUsecase) {
    super();
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
  @ApiQuery({
    name: 'nombre_max',
    type: Number,
    required: false,
    description: `nombre max de résultats, 6 par défaut`,
  })
  @ApiQuery({
    name: 'type',
    enum: ContentType,
    isArray: true,
    required: false,
    description: `les types attendu, kyc/article/quizz par défaut, les autres sont ignorés. Plusieurs types possible avec la notation ?type=XXX&type=YYY`,
  })
  @ApiOkResponse({ type: [RecommandationAPI] })
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: "Liste les recommendations personnalisées de l'utilisateur",
  })
  async getUserRecommandationV3(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Query('nombre_max') nombre_max?: number,
    @Query('type') type?: string[] | String,
  ): Promise<RecommandationAPI[]> {
    this.checkCallerId(req, utilisateurId);

    const liste_types_input = this.getStringListFromStringArrayAPIInput(type);

    const liste_types: ContentType[] = [];

    for (const type_string of liste_types_input) {
      liste_types.push(this.castContentTypeOrException(type_string));
    }

    const list = await this.recommandationUsecase.listRecommandationsV2(
      utilisateurId,
      undefined,
      nombre_max,
      liste_types,
    );
    return list.map((reco) => RecommandationAPI.mapToAPI(reco));
  }
}
