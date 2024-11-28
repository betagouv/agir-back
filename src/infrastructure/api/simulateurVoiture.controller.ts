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
import { SimulateurVoitureResultatAPI } from './types/simulateur_voiture/SimualteurVoitureResultatAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Simulateur Voiture')
export class SimulateurVoitureController extends GenericControler {
  constructor(
    private readonly simulateurVoitureUsecase: SimulateurVoitureUsecase,
  ) {
    super();
  }

  // TODO
  @ApiOkResponse({ type: SimulateurVoitureResultatAPI })
  @Get('utilisateurs/:utilisateurId/simulateur_voiture/resultat')
  @ApiOperation({
    summary:
      "Renvoie le résultat du simulateur voiture pour l'utilisateur donné",
  })
  @UseGuards(AuthGuard)
  async getResultat(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<SimulateurVoitureResultatAPI> {
    this.checkCallerId(req, utilisateurId);

    const results = await this.simulateurVoitureUsecase.calculerResultat(
      utilisateurId,
    );

    return SimulateurVoitureResultatAPI.mapToAPI(results);
  }
}
