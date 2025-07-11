import {
  Body,
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
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  Consultation,
  Ordre,
  Realisation,
} from '../../domain/actions/catalogueAction';
import { TypeAction } from '../../domain/actions/typeAction';
import { SousThematique } from '../../domain/thematique/sousThematique';
import { Thematique } from '../../domain/thematique/thematique';
import { ActionUsecase } from '../../usecase/actions.usecase';
import { ThematiqueUsecase } from '../../usecase/thematique.usecase';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { ActionAPI, ScoreActionAPI } from './types/actions/ActionAPI';
import { CatalogueActionAPI } from './types/actions/CatalogueActionAPI';
import { CompteutActionAPI } from './types/actions/CompteurActionAPI';
import { FeedbackActionInputAPI } from './types/actions/FeedbackActionInputAPI';
import { QuestionActionInputAPI } from './types/actions/QuestionActionInputAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Actions')
export class ActionsController extends GenericControler {
  constructor(
    private readonly actionUsecase: ActionUsecase,
    private readonly thematiqueUsecase: ThematiqueUsecase,
  ) {
    super();
  }

  @Get('actions')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 1000 } })
  @Header('Cache-Control', 'max-age=60')
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

  @Get('compteur_actions')
  @Header('Cache-Control', 'max-age=20')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 50, ttl: 1000 } })
  @ApiOkResponse({
    type: CompteutActionAPI,
  })
  @ApiOperation({
    summary: `Retourne les compteurs clés autour des actions`,
  })
  async getCompteurAction(): Promise<CompteutActionAPI> {
    const total = await this.actionUsecase.getCompteurActions();
    return CompteutActionAPI.map(total);
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
    name: 'sous_thematique',
    enum: SousThematique,
    enumName: 'sous thematique',
    isArray: true,
    required: false,
    description: `filtrage par sous thematiques, plusieurs sous thematiques possible avec la notation ?sous_thematique=XXX&sous_thematique=YYY`,
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
  @ApiQuery({
    name: 'realisation',
    enum: Realisation,
    required: false,
    description: `indique si on veut lister toutes les actions, celles faites, ou celles pas faites`,
  })
  @ApiQuery({
    name: 'ordre',
    enum: Ordre,
    required: false,
    description: `indique si on veut les recommandée par ordre de reco (et donc sans les actions exclues), ou toutes les action sans ordre particulier`,
  })
  @ApiQuery({
    name: 'skip',
    type: Number,
    required: false,
    description: `Combien de premiers éléments on veut écarter du résultat`,
  })
  @ApiQuery({
    name: 'take',
    type: Number,
    required: false,
    description: `Combien d'élements max on souhaite en retour`,
  })
  async getCatalogueUtilisateur(
    @Query('thematique') thematique: string[] | string,
    @Query('sous_thematique') sous_thematique: string[] | string,
    @Param('utilisateurId') utilisateurId: string,
    @Query('titre') titre: string,
    @Query('consultation') consultation: string,
    @Query('realisation') realisation: string,
    @Query('ordre') ordre: string,
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Request() req,
  ): Promise<CatalogueActionAPI> {
    this.checkCallerId(req, utilisateurId);
    const liste_thematiques_input =
      this.getStringListFromStringArrayAPIInput(thematique);
    const liste_sous_thematiques_input =
      this.getStringListFromStringArrayAPIInput(sous_thematique);

    const liste_thematiques: Thematique[] = [];
    const liste_sous_thematiques: SousThematique[] = [];

    for (const them_string of liste_thematiques_input) {
      liste_thematiques.push(this.castThematiqueOrException(them_string));
    }

    for (const them_string of liste_sous_thematiques_input) {
      liste_sous_thematiques.push(
        this.castSousThematiqueOrException(them_string),
      );
    }

    const type_consulation =
      this.castTypeConsultationActionOrException(consultation);

    const type_realisation =
      this.castTypeRealisationActionOrException(realisation);

    const type_ordre = this.castTypeOrdreActionOrException(ordre);

    const catalogue = await this.actionUsecase.getUtilisateurCatalogue(
      utilisateurId,
      liste_thematiques,
      liste_sous_thematiques,
      titre,
      type_consulation,
      type_realisation,
      type_ordre,
      skip ? parseInt(skip) : undefined,
      take ? parseInt(take) : undefined,
    );
    return CatalogueActionAPI.mapToAPI(catalogue);
  }

  @Post('utilisateurs/:utilisateurId/actions/:type_action/:code_action/faite')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: `déclare qu'une action est faite`,
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
  async faireAction(
    @Param('code_action') code_action: string,
    @Param('type_action') type_action: string,
    @Param('utilisateurId') utilisateurId: string,
    @Request() req,
  ) {
    this.checkCallerId(req, utilisateurId);
    let type = this.castTypeActionOrException(type_action);
    await this.actionUsecase.faireAction(code_action, type, utilisateurId);
  }

  @Delete('utilisateurs/:utilisateurId/actions/:type_action/:code_action')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: `Supprime de la liste de proposition une action de code donné, l'utilisateur n'est pas intéressé par cette action`,
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
    @Param('type_action') type_action: string,
    @Param('code_action') code_action: string,
    @Request() req,
  ) {
    this.checkCallerId(req, utilisateurId);
    let type = this.castTypeActionOrException(type_action);
    await this.thematiqueUsecase.removeAction(utilisateurId, code_action, type);
  }

  @Delete('utilisateurs/:utilisateurId/actions/first_block_of_six')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: `Supprime de la liste de propositions les 6 premieres actions recommandées`,
  })
  async remove6Actions(
    @Param('utilisateurId') utilisateurId: string,
    @Request() req,
  ) {
    this.checkCallerId(req, utilisateurId);

    await this.thematiqueUsecase.remove6FirstActions(utilisateurId);
  }

  @Post(
    'utilisateurs/:utilisateurId/actions/:type_action/:code_action/feedback',
  )
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: `Positionne un feedback pour une action donnée`,
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
  @ApiBody({
    type: FeedbackActionInputAPI,
  })
  async feedbackAction(
    @Param('code_action') code_action: string,
    @Param('type_action') type_action: string,
    @Param('utilisateurId') utilisateurId: string,
    @Body() body: FeedbackActionInputAPI,
    @Request() req,
  ) {
    this.checkCallerId(req, utilisateurId);
    let type = this.castTypeActionOrException(type_action);
    await this.actionUsecase.feedbackAction(
      code_action,
      type,
      utilisateurId,
      body.like_level,
      body.feedback,
    );
  }

  @Post('utilisateurs/:utilisateurId/actions/:type_action/:code_action/share')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: `Déclare le partage de cette action`,
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
  async shareAction(
    @Param('code_action') code_action: string,
    @Param('type_action') type_action: string,
    @Param('utilisateurId') utilisateurId: string,
    @Request() req,
  ) {
    this.checkCallerId(req, utilisateurId);
    let type = this.castTypeActionOrException(type_action);
    await this.actionUsecase.shareAction(code_action, type, utilisateurId);
  }

  @Post(
    'utilisateurs/:utilisateurId/actions/:type_action/:code_action/question',
  )
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: `Pose une question à l'équipe concernant une action`,
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
  @ApiBody({
    type: QuestionActionInputAPI,
  })
  async questionAction(
    @Param('code_action') code_action: string,
    @Param('type_action') type_action: string,
    @Param('utilisateurId') utilisateurId: string,
    @Body() body: QuestionActionInputAPI,
    @Request() req,
  ) {
    this.checkCallerId(req, utilisateurId);
    let type = this.castTypeActionOrException(type_action);
    await this.actionUsecase.questionAction(
      code_action,
      type,
      utilisateurId,
      body.question,
    );
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
