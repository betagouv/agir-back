import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
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
import { ActionAPI } from './types/actions/ActionAPI';
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

  @Get('actions/:code_action')
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
  async getAction(
    @Param('code_action') code_action: string,
    @Query('code_commune') code_commune: string,
  ): Promise<ActionAPI> {
    const result = await this.actionUsecase.getAction(
      code_action,
      code_commune,
    );
    return ActionAPI.mapToAPI(result);
  }

  @Get('utilisateurs/:utilisateurId/actions/:code_action')
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
  async getUtilisateurAction(
    @Param('code_action') code_action: string,
    @Param('utilisateurId') utilisateurId: string,
    @Request() req,
  ): Promise<ActionAPI> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.actionUsecase.getUtilisateurAction(
      code_action,
      utilisateurId,
    );
    return ActionAPI.mapToAPI(result);
  }
}
