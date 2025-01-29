import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AidesUsecase } from '../../usecase/aides.usecase';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { AideAPI_v2 } from './types/aide/AideAPI_v2';
import { AideExportAPI } from './types/aide/AideExportAPI';
import { AidesVeloParTypeAPI } from './types/aide/AidesVeloParTypeAPI';
import { InputAideVeloAPI } from './types/aide/inputAideVeloAPI';
import { InputAideVeloAPI_v2 } from './types/aide/inputAideVeloAPI_v2';

@Controller()
@ApiBearerAuth()
@ApiTags('Aides')
export class AidesController extends GenericControler {
  constructor(private readonly aidesUsecase: AidesUsecase) {
    super();
  }

  @ApiOkResponse({ type: [AideExportAPI] })
  @ApiOperation({
    summary:
      "Export l'ensemble du catalogue d'aides avec les tagging METRO-CA-CC-CU",
  })
  @Get('aides')
  async getCatalogueAidesComplet(@Request() req): Promise<AideExportAPI[]> {
    this.checkCronAPIProtectedEndpoint(req);
    const aides = await this.aidesUsecase.exportAides();
    return aides.map((elem) => AideExportAPI.mapToAPI(elem));
  }

  @Post('utilisateurs/:utilisateurId/aides/:aideId/vu_infos')
  @ApiOperation({
    summary: `Indique que l'utilisateur est allé voir la page source de présentation de l'aide`,
  })
  @UseGuards(AuthGuard)
  async vuInfo(
    @Param('utilisateurId') utilisateurId: string,
    @Param('aideId') aideId: string,
    @Request() req,
  ): Promise<void> {
    this.checkCallerId(req, utilisateurId);
    await this.aidesUsecase.clickAideInfosLink(utilisateurId, aideId);
  }
  @Post('utilisateurs/:utilisateurId/aides/:aideId/vu_demande')
  @ApiOperation({
    summary: `Indique que l'utilisateur est allé voir la page source de demande de l'aide`,
  })
  @UseGuards(AuthGuard)
  async vuDemande(
    @Param('utilisateurId') utilisateurId: string,
    @Param('aideId') aideId: string,
    @Request() req,
  ): Promise<void> {
    this.checkCallerId(req, utilisateurId);
    await this.aidesUsecase.clickAideDemandeLink(utilisateurId, aideId);
  }

  @ApiOkResponse({ type: AideAPI_v2 })
  @Get('utilisateurs/:utilisateurId/aides_v2')
  @UseGuards(AuthGuard)
  async getCatalogueAides_v2(
    @Param('utilisateurId') utilisateurId: string,
    @Request() req,
  ): Promise<AideAPI_v2> {
    this.checkCallerId(req, utilisateurId);
    const aides = await this.aidesUsecase.getCatalogueAides(utilisateurId);
    return AideAPI_v2.mapToAPI(aides.aides, aides.utilisateur);
  }

  @ApiOkResponse({ type: AidesVeloParTypeAPI })
  @Post('utilisateurs/:utilisateurId/simulerAideVelo')
  @ApiOperation({
    deprecated: true,
    summary:
      "DEPRECATED : utiliser l'endpoint simulerAideVelo_v2 qui permet de simuler l'aide vélo pour un utilisateur en fonction de l'état du vélo (neuf ou occasion).",
  })
  @ApiBody({
    type: InputAideVeloAPI,
  })
  @UseGuards(AuthGuard)
  async getAllVelosByUtilisateur(
    @Param('utilisateurId') utilisateurId: string,
    @Body() body: InputAideVeloAPI,
    @Request() req,
  ): Promise<AidesVeloParTypeAPI> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.aidesUsecase.simulerAideVelo(
      utilisateurId,
      body.prix_du_velo,
    );
    return AidesVeloParTypeAPI.mapToAPI(result);
  }

  @ApiOkResponse({ type: AidesVeloParTypeAPI })
  @Post('utilisateurs/:utilisateurId/simulerAideVelo_v2')
  @ApiBody({
    type: InputAideVeloAPI_v2,
  })
  @UseGuards(AuthGuard)
  async getAllVelosByUtilisateur_v2(
    @Param('utilisateurId') utilisateurId: string,
    @Body() body: InputAideVeloAPI_v2,
    @Request() req,
  ): Promise<AidesVeloParTypeAPI> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.aidesUsecase.simulerAideVelo(
      utilisateurId,
      body.prix_du_velo,
      body.etat_du_velo,
    );
    return AidesVeloParTypeAPI.mapToAPI(result);
  }
}
