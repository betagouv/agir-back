import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Param,
  UseGuards,
  Request,
  Get,
  Query,
} from '@nestjs/common';
import { GenericControler } from './genericControler';
import { ThematiqueUsecase } from '../../usecase/thematique.usecase';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { SyntheseThematiquesAPI } from './types/thematiques/syntheseThematiquesAPI';
import { AuthGuard } from '../auth/guard';
import { Thematique } from '../../domain/thematique/thematique';
import { DetailThematiquesAPI } from './types/thematiques/detailThematiquesAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Thematiques')
export class ThematiqueController extends GenericControler {
  constructor(private thematiqueUsecase: ThematiqueUsecase) {
    super();
  }

  @Get('thematiques')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 1000 } })
  @ApiOkResponse({
    type: SyntheseThematiquesAPI,
  })
  @ApiOperation({
    summary: `Retourne la synthèse des 4 thématiques principales disponibles sur le services`,
  })
  @ApiQuery({
    name: 'code_commune',
    type: String,
    required: false,
    description: `code commune INSEE pour calculer le nombre d'aides disponibles pour les différentes thématiques`,
  })
  async getTuilesThematiques(
    @Query('code_commune') code_commune: string,
  ): Promise<SyntheseThematiquesAPI> {
    const result = await this.thematiqueUsecase.getListeThematiquesPrincipales(
      code_commune,
    );
    return SyntheseThematiquesAPI.mapToAPI(result);
  }

  @Get('utilisateurs/:utilisateurId/thematiques')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: SyntheseThematiquesAPI,
  })
  @ApiOperation({
    summary: `Retourne la synthèse des 4 thématiques principales disponibles sur le services`,
  })
  async getUtilisateurTuilesThematiques(
    @Param('utilisateurId') utilisateurId: string,
    @Request() req,
  ): Promise<SyntheseThematiquesAPI> {
    this.checkCallerId(req, utilisateurId);

    const result =
      await this.thematiqueUsecase.getUtilisateurListeThematiquesPrincipales(
        utilisateurId,
      );

    return SyntheseThematiquesAPI.mapToAPI(result);
  }

  @Get('utilisateurs/:utilisateurId/thematiques/:code_thematique')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: DetailThematiquesAPI,
  })
  @ApiOperation({
    summary: `Retourne le détail d'une thematiques (question de personnalisatio, propositions d'action, etc)`,
  })
  @ApiParam({
    name: 'code_thematique',
    enum: Thematique,
    description: `code thématique`,
  })
  async getUtilisateurThematiqueCible(
    @Param('utilisateurId') utilisateurId: string,
    @Param('code_thematique') code_thematique: string,

    @Request() req,
  ): Promise<DetailThematiquesAPI> {
    this.checkCallerId(req, utilisateurId);
    let them;
    if (code_thematique) {
      them = this.castThematiqueOrException(code_thematique);
    }

    const result = await this.thematiqueUsecase.getUtilisateurThematique(
      utilisateurId,
      them,
    );

    return DetailThematiquesAPI.mapToAPI(result);
  }
}
