import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Param,
  Body,
  UseGuards,
  Request,
  Get,
  Patch,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { ActionAPI, ScoreActionAPI } from './types/actions/ActionAPI';
import { ActionUsecase } from '../../usecase/actions.usecase';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Thematique } from '../../domain/contenu/thematique';
import { ActionLightAPI } from './types/actions/ActionLightAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Actions')
export class ActionsController extends GenericControler {
  constructor(private readonly actionUsecase: ActionUsecase) {
    super();
  }

  @Get('actions')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 1000 } })
  @ApiOkResponse({
    type: [ActionLightAPI],
  })
  @ApiOperation({
    summary: `Retourne le catalogue d'actions`,
  })
  @ApiQuery({
    name: 'thematique',
    enum: Thematique,
    enumName: 'thematique',
    required: false,
    description: `filtrage par une thematique`,
  })
  @ApiQuery({
    name: 'code_commune',
    type: String,
    required: false,
    description: `code commune INSEE pour calculer le nombre d'aides disponible pour cette localisation`,
  })
  async getCatalogue(
    @Query('thematique') thematique: string,
    @Query('code_commune') code_commune: string,
  ): Promise<ActionLightAPI[]> {
    let them;
    if (thematique) {
      them = this.castThematiqueOrException(thematique);
    }
    const result = await this.actionUsecase.getOpenCatalogue(
      them,
      code_commune,
    );
    return result.map((r) => ActionLightAPI.mapToAPI(r));
  }

  @Get('utilisateurs/:utilisateurId/actions')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: [ActionLightAPI],
  })
  @ApiOperation({
    summary: `Retourne le catalogue d'actions pour un utilisateur donné`,
  })
  @ApiQuery({
    name: 'thematique',
    enum: Thematique,
    enumName: 'thematique',
    required: false,
    description: `filtrage par une thematique`,
  })
  async getCatalogueUtilisateur(
    @Query('thematique') thematique: string,
    @Param('utilisateurId') utilisateurId: string,
    @Request() req,
  ): Promise<ActionLightAPI[]> {
    this.checkCallerId(req, utilisateurId);
    let them;
    if (thematique) {
      them = this.castThematiqueOrException(thematique);
    }
    const result = await this.actionUsecase.getUtilisateurCatalogue(
      utilisateurId,
      them,
    );
    return result.map((r) => ActionLightAPI.mapToAPI(r));
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
    type: String,
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
    type: String,
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
    return { score: result };
  }
}
