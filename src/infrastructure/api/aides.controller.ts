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
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AidesUsecase } from '../../usecase/aides.usecase';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { AideAPI } from './types/aide/AideAPI';
import { AideAPI_v2 } from './types/aide/AideAPI_v2';
import { AideExportAPI } from './types/aide/AideExportAPI';
import { AidesVeloParTypeAPI } from './types/aide/AidesVeloParTypeAPI';
import { InputAideVeloAPI } from './types/aide/inputAideVeloAPI';
import { ApplicationError } from '../applicationError';

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
}
