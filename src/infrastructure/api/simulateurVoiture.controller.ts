import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SimulateurVoitureUsecase } from 'src/usecase/simulateurVoiture.usecase';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import {
  AlternativeAPI,
  VoitureCibleAPI,
  VoitureInfosAPI,
} from './types/simulateur_voiture/SimulateurVoitureResultatAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Simulateur Voiture')
export class SimulateurVoitureController extends GenericControler {
  constructor(
    private readonly simulateurVoitureUsecase: SimulateurVoitureUsecase,
  ) {
    super();
  }

  @ApiOkResponse({ type: VoitureInfosAPI })
  @Get(
    'utilisateurs/:utilisateurId/simulateur_voiture/resultat/voiture_actuelle',
  )
  @ApiOperation({
    summary:
      "Renvoie le résultat pour la voiture actuelle de l'utilisateur donné",
  })
  @UseGuards(AuthGuard)
  async getResultatVoitureActuelle(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<VoitureInfosAPI> {
    this.checkCallerId(req, utilisateurId);

    const results = await this.simulateurVoitureUsecase.calculerVoitureActuelle(
      utilisateurId,
    );

    return VoitureInfosAPI.mapToAPI(results);
  }

  @ApiOkResponse({ type: [AlternativeAPI] })
  @Get('utilisateurs/:utilisateurId/simulateur_voiture/resultat/alternatives')
  @ApiOperation({
    summary:
      "Renvoie le résultat pour les alternatives à l'achat de la voiture actuelle de l'utilisateur donné",
    description:
      'Le premier appel effectué pour un utilisateur donné, va effectuer le calcul qui est une opération lourde.',
  })
  @UseGuards(AuthGuard)
  async getResultat(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<AlternativeAPI[]> {
    this.checkCallerId(req, utilisateurId);

    const results =
      await this.simulateurVoitureUsecase.calculerVoitureAlternatives(
        utilisateurId,
      );

    return results.map(AlternativeAPI.mapToAPI);
  }

  @ApiOkResponse({ type: VoitureCibleAPI })
  @Get('utilisateurs/:utilisateurId/simulateur_voiture/resultat/voiture_cible')
  @ApiOperation({
    summary: "Renvoie le résultat pour la voiture cible de l'utilisateur donné",
  })
  @UseGuards(AuthGuard)
  async getResultatVoitureCible(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<VoitureCibleAPI> {
    this.checkCallerId(req, utilisateurId);

    const results = await this.simulateurVoitureUsecase.calculerVoitureCible(
      utilisateurId,
    );

    return VoitureCibleAPI.mapToAPI(results);
  }
}
