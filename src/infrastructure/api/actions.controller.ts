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
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Consultation } from '../../domain/actions/catalogueAction';
import { TypeAction } from '../../domain/actions/typeAction';
import { Thematique } from '../../domain/thematique/thematique';
import { ActionUsecase } from '../../usecase/actions.usecase';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { ActionAPI, ScoreActionAPI } from './types/actions/ActionAPI';
import { CatalogueActionAPI } from './types/actions/CatalogueActionAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Actions')
export class ActionsController extends GenericControler {
  constructor(private readonly actionUsecase: ActionUsecase) {
    super();
  }

  @Get('actions')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 1000 } })
  @ApiOkResponse({
    type: CatalogueActionAPI,
  })
  @ApiOperation({
    summary: `Retourne le catalogue d'actions`,
  })
  @ApiQuery({
    name: 'thematique',
    enum: Thematique,
    enumName: 'thematique',
    isArray: true,
    required: false,
    description: `filtrage par thematiques, plusieurs thematiques possible avec la notation ?thematique=XXX&thematique=YYY`,
  })
  @ApiQuery({
    name: 'code_commune',
    type: String,
    required: false,
    description: `code commune INSEE pour calculer le nombre d'aides disponible pour cette localisation`,
  })
  @ApiQuery({
    name: 'titre',
    type: String,
    required: false,
    description: `une fragment du titre, insensible à la casse, pour recherche textuelle`,
  })
  async getCatalogue(
    @Query('thematique') thematique: string[] | string,
    @Query('code_commune') code_commune: string,
    @Query('titre') titre?: string,
  ): Promise<CatalogueActionAPI> {
    const liste_thematiques_input =
      this.getStringListFromStringArrayAPIInput(thematique);

    const liste_thematiques: Thematique[] = [];

    for (const them_string of liste_thematiques_input) {
      liste_thematiques.push(this.castThematiqueOrException(them_string));
    }

    const catalogue = await this.actionUsecase.getOpenCatalogue(
      liste_thematiques,
      code_commune,
      titre,
    );

    return CatalogueActionAPI.mapToAPI(catalogue);
  }

  @Get('utilisateurs/:utilisateurId/actions')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: CatalogueActionAPI,
  })
  @ApiOperation({
    summary: `Retourne le catalogue d'actions pour un utilisateur donné`,
  })
  @ApiQuery({
    name: 'thematique',
    enum: Thematique,
    enumName: 'thematique',
    isArray: true,
    required: false,
    description: `filtrage par thematiques, plusieurs thematiques possible avec la notation ?thematique=XXX&thematique=YYY`,
  })
  @ApiQuery({
    name: 'titre',
    type: String,
    required: false,
    description: `une fragment du titre, insensible à la casse, pour recherche textuelle`,
  })
  @ApiQuery({
    name: 'consultation',
    enum: Consultation,
    required: false,
    description: `indique si on veut lister toutes les actions, celles vues, ou celles pas vues`,
  })
  async getCatalogueUtilisateur(
    @Query('thematique') thematique: string[] | string,
    @Param('utilisateurId') utilisateurId: string,
    @Query('titre') titre: string,
    @Query('consultation') consultation: string,
    @Request() req,
  ): Promise<CatalogueActionAPI> {
    this.checkCallerId(req, utilisateurId);
    const liste_thematiques_input =
      this.getStringListFromStringArrayAPIInput(thematique);

    const liste_thematiques: Thematique[] = [];

    for (const them_string of liste_thematiques_input) {
      liste_thematiques.push(this.castThematiqueOrException(them_string));
    }

    const type_consulation =
      this.castTypeConsultationActionOrException(consultation);

    const catalogue = await this.actionUsecase.getUtilisateurCatalogue(
      utilisateurId,
      liste_thematiques,
      titre,
      type_consulation,
    );
    return CatalogueActionAPI.mapToAPI(catalogue);
  }

  @Get('actions/:type_action/:code_action')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 2000 } })
  @ApiOkResponse({
    type: ActionAPI,
  })
  @ApiOperation({
    summary: `Retourne une action précise`,
  })
  @ApiQuery({
    name: 'code_commune',
    type: String,
    required: false,
    description: `code commune INSEE pour personnalisation de l'action (aides / lieux utiles / etc)`,
  })
  @ApiParam({
    name: 'type_action',
    enum: TypeAction,
    description: `type de l'action (classique/bilan/quizz/etc)`,
  })
  @ApiParam({
    name: 'code_action',
    type: String,
    description: `code fonctionnel de l'action`,
  })
  async getAction(
    @Param('code_action') code_action: string,
    @Param('type_action') type_action: string,
    @Query('code_commune') code_commune: string,
  ): Promise<ActionAPI> {
    let type = this.castTypeActionOrException(type_action);
    const result = await this.actionUsecase.getAction(
      code_action,
      type,
      code_commune,
    );
    return ActionAPI.mapToAPI(result);
  }
  @Get('preview/actions/:type_action/:content_id')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 1000 } })
  @ApiOkResponse({
    type: ActionAPI,
  })
  @ApiOperation({
    summary: `Retourne la preview CMS d'une action (elle peut encore être en DRAFT côté CMS)`,
  })
  @ApiParam({
    name: 'type_action',
    enum: TypeAction,
    description: `type de l'action (classique/bilan/quizz/etc)`,
  })
  @ApiParam({
    name: 'content_id',
    type: String,
    description: `id CMS de l'action`,
  })
  async getActionPreview(
    @Param('content_id') content_id: string,
    @Param('type_action') type_action: string,
  ): Promise<ActionAPI> {
    let type = this.castTypeActionOrException(type_action);
    const result = await this.actionUsecase.getActionPreview(content_id, type);
    return ActionAPI.mapToAPI(result);
  }

  @Get('utilisateurs/:utilisateurId/actions/:type_action/:code_action')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: ActionAPI,
  })
  @ApiOperation({
    summary: `Retourne une action précise`,
  })
  @ApiQuery({
    name: 'code_commune',
    type: String,
    required: false,
    description: `code commune INSEE pour personnalisation de l'action (aides / lieux utiles / etc)`,
  })
  @ApiParam({
    name: 'type_action',
    enum: TypeAction,
    description: `type de l'action (classique/bilan/quizz/etc)`,
  })
  @ApiParam({
    name: 'code_action',
    type: String,
    description: `code fonctionnel de l'action`,
  })
  async getUtilisateurAction(
    @Param('code_action') code_action: string,
    @Param('type_action') type_action: string,
    @Param('utilisateurId') utilisateurId: string,
    @Request() req,
  ): Promise<ActionAPI> {
    this.checkCallerId(req, utilisateurId);
    let type = this.castTypeActionOrException(type_action);
    const result = await this.actionUsecase.getUtilisateurAction(
      code_action,
      type,
      utilisateurId,
    );
    return ActionAPI.mapToAPI(result);
  }
  @Get('utilisateurs/:utilisateurId/actions/quizz/:code_action/score')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: ScoreActionAPI,
  })
  @ApiOperation({
    summary: `Retourne le score courant de cette action de type quizz`,
  })
  @ApiParam({
    name: 'code_action',
    type: String,
    description: `code fonctionnel de l'action`,
  })
  async getActionQuizzScore(
    @Param('code_action') code_action: string,
    @Param('utilisateurId') utilisateurId: string,
    @Request() req,
  ): Promise<ScoreActionAPI> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.actionUsecase.calculeScoreQuizzAction(
      utilisateurId,
      code_action,
    );
    return result;
  }
}
