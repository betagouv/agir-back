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
import { BilanCarboneUsecase } from '../../usecase/bilanCarbone.usecase';
import { AuthGuard } from '../auth/guard';
import { BilanCarboneDashboardAPI_v3 } from './types/ngc/bilanAPI_v3';

@Controller()
@ApiBearerAuth()
@ApiTags('Bilan Carbone')
export class BilanCarboneController extends GenericControler {
  constructor(private readonly bilanCarboneUsecase: BilanCarboneUsecase) {
    super();
  }

  @ApiOkResponse({ type: BilanCarboneDashboardAPI_v3 })
  @ApiQuery({
    name: 'force',
    type: String,
    required: false,
    description: `si renseigné (à n'importe quoi), alors force le calcul du bilan complet, ainsi que tout ce qui peut être calculé dans le bilan approximatif`,
  })
  @Get('utilisateurs/:utilisateurId/bilans/last_v3')
  @ApiOperation({
    summary:
      "Renvoie le bilan carbone courant de l'utilisateur - nouveau format - plus d'univers !",
  })
  @UseGuards(AuthGuard)
  async getBilan_V3(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Query('force') force: string,
  ): Promise<BilanCarboneDashboardAPI_v3> {
    this.checkCallerId(req, utilisateurId);
    const bilan = await this.bilanCarboneUsecase.getCurrentBilanByUtilisateurId(
      utilisateurId,
    );
    return BilanCarboneDashboardAPI_v3.mapToAPI(
      bilan.bilan_complet,
      bilan.bilan_synthese,
      force,
    );
  }

  @Post('utilisateurs/compute_bilan_carbone')
  async computeBilanTousUtilisateurs(@Request() req): Promise<any> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.bilanCarboneUsecase.computeBilanTousUtilisateurs();
  }
}
