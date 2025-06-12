import {
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { TypeAction } from '../../domain/actions/typeAction';
import { Thematique } from '../../domain/thematique/thematique';
import { ThematiqueUsecase } from '../../usecase/thematique.usecase';
import { ThematiqueBoardUsecase } from '../../usecase/thematiqueBoard.usecase';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { DetailThematiquesAPI } from './types/thematiques/detailThematiquesAPI';
import { HomeBoardAPI } from './types/thematiques/HomeBoardAPI';
import { SyntheseThematiquesAPI } from './types/thematiques/syntheseThematiquesAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Thematiques')
export class ThematiqueController extends GenericControler {
  constructor(
    private thematiqueUsecase: ThematiqueUsecase,
    private thematiqueBoardUsecase: ThematiqueBoardUsecase,
  ) {
    super();
  }

  @Get('thematiques')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 1000 } })
  @Header('Cache-Control', 'max-age=600')
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
    const result =
      await this.thematiqueBoardUsecase.getListeThematiquesPrincipales(
        code_commune,
      );
    return SyntheseThematiquesAPI.mapToAPI(result);
  }

  @Get('utilisateurs/:utilisateurId/thematiques')
  @Header('Cache-Control', 'max-age=20')
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
      await this.thematiqueBoardUsecase.getUtilisateurListeThematiquesPrincipales(
        utilisateurId,
      );

    return SyntheseThematiquesAPI.mapToAPI(result);
  }

  @Get('utilisateurs/:utilisateurId/home_board')
  @Header('Cache-Control', 'max-age=5')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: HomeBoardAPI,
  })
  @ApiOperation({
    summary: `Retourne les infos de la home d'un utilisateur`,
  })
  async getHomeBoard(
    @Param('utilisateurId') utilisateurId: string,
    @Request() req,
  ): Promise<HomeBoardAPI> {
    this.checkCallerId(req, utilisateurId);

    const result = await this.thematiqueBoardUsecase.buildHomeBoard(
      utilisateurId,
    );

    return HomeBoardAPI.mapToAPI(result);
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

  @Post(
    'utilisateurs/:utilisateurId/thematiques/:code_thematique/personnalisation_ok',
  )
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: `Déclare la personnalisation faire pour cette thematique`,
  })
  @ApiParam({
    name: 'code_thematique',
    enum: Thematique,
    description: `code thématique`,
  })
  async setPersonnalisationDone(
    @Param('utilisateurId') utilisateurId: string,
    @Param('code_thematique') code_thematique: string,
    @Request() req,
  ) {
    this.checkCallerId(req, utilisateurId);
    let them;
    if (code_thematique) {
      them = this.castThematiqueOrException(code_thematique);
    }
    await this.thematiqueUsecase.declarePersonnalisationOK(utilisateurId, them);
  }

  @Post(
    'utilisateurs/:utilisateurId/thematiques/:code_thematique/reset_personnalisation',
  )
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: `Déclare la personnalisation à refaire sur cette thematique`,
  })
  @ApiParam({
    name: 'code_thematique',
    enum: Thematique,
    description: `code thématique`,
  })
  async resetPersonnalisation(
    @Param('utilisateurId') utilisateurId: string,
    @Param('code_thematique') code_thematique: string,
    @Request() req,
  ) {
    this.checkCallerId(req, utilisateurId);
    let them;
    if (code_thematique) {
      them = this.castThematiqueOrException(code_thematique);
    }
    await this.thematiqueUsecase.resetPersonnalisation(utilisateurId, them);
  }

  @Delete(
    'utilisateurs/:utilisateurId/thematiques/:code_thematique/actions/:type_action/:code_action',
  )
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: `Supprime de la liste de proposition une action de code donné`,
  })
  @ApiParam({
    name: 'code_thematique',
    enum: Thematique,
    description: `code thématique`,
  })
  @ApiParam({
    name: 'code_action',
    type: String,
    description: `Code de l'action à supprimer de la selection`,
  })
  @ApiParam({
    name: 'type_action',
    enum: TypeAction,
    description: `Type de l'action à supprimer de la selection`,
  })
  async removeAction(
    @Param('utilisateurId') utilisateurId: string,
    @Param('code_thematique') code_thematique: string,
    @Param('type_action') type_action: string,
    @Param('code_action') code_action: string,
    @Request() req,
  ) {
    this.checkCallerId(req, utilisateurId);
    let type = this.castTypeActionOrException(type_action);
    let them;
    if (code_thematique) {
      them = this.castThematiqueOrException(code_thematique);
    }
    await this.thematiqueUsecase.removeAction(
      utilisateurId,
      them,
      code_action,
      type,
    );
  }
  @Delete(
    'utilisateurs/:utilisateurId/thematiques/:code_thematique/actions/first_block_of_six',
  )
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: `Supprime de la liste de propositions les 6 premieres actions recommandées`,
  })
  @ApiParam({
    name: 'code_thematique',
    enum: Thematique,
    description: `code thématique`,
  })
  async remove6Actions(
    @Param('utilisateurId') utilisateurId: string,
    @Param('code_thematique') code_thematique: string,
    @Request() req,
  ) {
    this.checkCallerId(req, utilisateurId);
    let them;
    if (code_thematique) {
      them = this.castThematiqueOrException(code_thematique);
    }

    await this.thematiqueUsecase.remove6FirstActions(utilisateurId, them);
  }
}
