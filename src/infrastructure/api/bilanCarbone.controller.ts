import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { GenericControler } from './genericControler';
import { BilanCarboneUsecase } from '../../usecase/bilanCarbone.usecase';
import { BilanCarboneAPI } from './types/ngc/bilanAPI';
import { AuthGuard } from '../auth/guard';

@Controller()
@ApiBearerAuth()
@ApiTags('Bilan Carbone')
export class BilanCarboneController extends GenericControler {
  constructor(private readonly bilanCarboneUsecase: BilanCarboneUsecase) {
    super();
  }

  @ApiOkResponse({ type: BilanCarboneAPI })
  @Get('utilisateur/:utilisateurId/bilans/last')
  @UseGuards(AuthGuard)
  async getBilan(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<BilanCarboneAPI> {
    this.checkCallerId(req, utilisateurId);
    const bilan = await this.bilanCarboneUsecase.getCurrentBilanByUtilisateurId(
      utilisateurId,
    );
    return BilanCarboneAPI.mapToAPI(bilan);
  }

  @Post('utilisateurs/compute_bilan_carbone')
  async computeBilanTousUtilisateurs(@Request() req): Promise<any> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.bilanCarboneUsecase.computeBilanTousUtilisateurs();
  }
}
