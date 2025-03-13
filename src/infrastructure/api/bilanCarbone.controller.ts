import {
  Controller,
  Get,
  Param,
  Post,
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
import { Thematique } from '../../domain/thematique/thematique';
import { BilanCarboneUsecase } from '../../usecase/bilanCarbone.usecase';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { BilanCarboneDashboardAPI_v3 } from './types/ngc/bilanAPI_v3';
import { BilanThematiqueAPI } from './types/ngc/bilanThematiqueAPI';
import { BilanTotalAPI } from './types/ngc/bilanTotalAPI';

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

  @Get('utilisateurs/:utilisateurId/bilans/last_v3/:code_thematique')
  @ApiOperation({
    summary:
      "Renvoie le bilan carbone courant de l'utilisateur pour une thematique donnée",
  })
  @ApiParam({
    name: 'code_thematique',
    enum: Thematique,
    description: `code thématique`,
    required: true,
  })
  @ApiOkResponse({
    type: BilanThematiqueAPI,
  })
  @UseGuards(AuthGuard)
  async getBilan_V3_thematique(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('code_thematique') code_thematique: string,
  ): Promise<BilanThematiqueAPI> {
    this.checkCallerId(req, utilisateurId);

    const them = this.castThematiqueOrException(code_thematique);

    const bilan =
      await this.bilanCarboneUsecase.getCurrentBilanByUtilisateurIdAndThematique(
        utilisateurId,
        them,
      );
    return BilanThematiqueAPI.mapToAPI(bilan);
  }

  @ApiOkResponse({ type: BilanTotalAPI })
  @Get('utilisateurs/:utilisateurId/bilans/total')
  @ApiOperation({
    summary:
      'Renvoie la valeur totale annuelle du bilan carbone utilisateur en kg',
  })
  @UseGuards(AuthGuard)
  async getBilanTotal(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<BilanTotalAPI> {
    this.checkCallerId(req, utilisateurId);
    const bilan = await this.bilanCarboneUsecase.getCurrentBilanValeurTotale(
      utilisateurId,
    );
    return { impact_kg_annee: bilan };
  }

  @Post('utilisateurs/compute_bilan_carbone')
  async computeBilanTousUtilisateurs(@Request() req): Promise<any> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.bilanCarboneUsecase.computeBilanTousUtilisateurs();
  }
}
