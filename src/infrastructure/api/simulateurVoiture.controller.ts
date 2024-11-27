import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { SimulateurVoitureUsecase } from 'src/usecase/simulateurVoiture.usecase';
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
  // @ApiOkResponse({ type: BilanCarboneDashboardAPI_v3 })
  @ApiQuery({
    name: 'force',
    type: String,
    required: false,
    description: `si renseigné (à n'importe quoi), alors force le calcul du bilan complet, ainsi que tout ce qui peut être calculé dans le bilan approximatif`,
  })
  @Get('utilisateurs/:utilisateurId/simulateur_voiture')
  @ApiOperation({
    summary:
      "Renvoie le bilan carbone courant de l'utilisateur - nouveau format - plus d'univers !",
  })
  @UseGuards(AuthGuard)
  async getBilan_V3(
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
