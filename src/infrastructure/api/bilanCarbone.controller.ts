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
import { BilanCarboneDashboardAPI } from './types/ngc/bilanAPI';
import { AuthGuard } from '../auth/guard';
import { BilanCarboneDashboardAPI_v2 } from './types/ngc/bilanAPI_v2';
import { BilanCarboneDashboardAPI_v3 } from './types/ngc/bilanAPI_v3';

@Controller()
@ApiBearerAuth()
@ApiTags('Bilan Carbone')
export class BilanCarboneController extends GenericControler {
  constructor(private readonly bilanCarboneUsecase: BilanCarboneUsecase) {
    super();
  }

  @ApiOkResponse({ type: BilanCarboneDashboardAPI })
  @Get('utilisateur/:utilisateurId/bilans/last')
  @ApiOperation({
    deprecated: true,
    summary: "DEPRECATED : Renvoie le bilan carbone courant de l'utilisateur",
  })
  @UseGuards(AuthGuard)
  async getBilan_deprecated(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<BilanCarboneDashboardAPI> {
    this.checkCallerId(req, utilisateurId);
    const bilan = await this.bilanCarboneUsecase.getCurrentBilanByUtilisateurId(
      utilisateurId,
    );
    return BilanCarboneDashboardAPI.mapToAPI(
      bilan.bilan_complet,
      bilan.bilan_synthese,
    );
  }

  @ApiOkResponse({ type: BilanCarboneDashboardAPI_v2 })
  @ApiQuery({
    name: 'force',
    type: String,
    required: false,
    description: `si renseigné (à n'importe quoi), alors force le calcul du bilan complet, ainsi que tout ce qui peut être calculé dans le bilan approximatif`,
  })
  @ApiOperation({
    deprecated: true,
    summary:
      "DEPRECATED : Renvoie le bilan carbone courant de l'utilisateur - nouveau format",
  })
  @Get('utilisateur/:utilisateurId/bilans/last_v2')
  @UseGuards(AuthGuard)
  async getBilan_V2_deprecated(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Query('force') force: string,
  ): Promise<BilanCarboneDashboardAPI_v2> {
    this.checkCallerId(req, utilisateurId);
    const bilan = await this.bilanCarboneUsecase.getCurrentBilanByUtilisateurId(
      utilisateurId,
    );
    return BilanCarboneDashboardAPI_v2.mapToAPI(
      bilan.bilan_complet,
      bilan.bilan_synthese,
      force,
    );
  }

  @ApiOkResponse({ type: BilanCarboneDashboardAPI_v2 })
  @ApiQuery({
    name: 'force',
    type: String,
    required: false,
    description: `si renseigné (à n'importe quoi), alors force le calcul du bilan complet, ainsi que tout ce qui peut être calculé dans le bilan approximatif`,
  })
  @Get('utilisateurs/:utilisateurId/bilans/last_v2')
  @ApiOperation({
    deprecated: true,
    summary:
      "DEPRECATED : Renvoie le bilan carbone courant de l'utilisateur - nouveau format",
  })
  @UseGuards(AuthGuard)
  async getBilan_V2(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Query('force') force: string,
  ): Promise<BilanCarboneDashboardAPI_v2> {
    this.checkCallerId(req, utilisateurId);
    const bilan = await this.bilanCarboneUsecase.getCurrentBilanByUtilisateurId(
      utilisateurId,
    );
    return BilanCarboneDashboardAPI_v2.mapToAPI(
      bilan.bilan_complet,
      bilan.bilan_synthese,
      force,
    );
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
