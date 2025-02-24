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
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { App } from '../../domain/app';
import { AidesUsecase } from '../../usecase/aides.usecase';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { AideAPI_v2 } from './types/aide/AideAPI_v2';
import { AideExportAPI } from './types/aide/AideExportAPI';
import { AidesVeloParTypeAPI } from './types/aide/AidesVeloParTypeAPI';
import { AideVeloNonCalculeeAPI } from './types/aide/AideVeloNonCalculeesAPI';
import { InputAideVeloAPI } from './types/aide/inputAideVeloAPI';
import { InputAideVeloOpenAPI } from './types/aide/inputAideVeloOpenAPI';
import { InputRecupererAideVeloAPI } from './types/aide/InputRecupererAideVeloAPI';

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
      body.etat_du_velo,
    );
    return AidesVeloParTypeAPI.mapToAPI(result);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: App.getThrottleLimit(), ttl: 1000 } })
  @ApiOkResponse({ type: AidesVeloParTypeAPI })
  @Post('aides/simulerAideVelo')
  @ApiBody({
    type: InputAideVeloOpenAPI,
  })
  async simulerAideVelo(
    @Body() body: InputAideVeloOpenAPI,
  ): Promise<AidesVeloParTypeAPI> {
    const result = await this.aidesUsecase.simulerAideVeloParCodeCommmuneOuEPCI(
      body.code_insee,
      body.prix_du_velo,
      body.rfr,
      body.parts,
      body.etat_du_velo,
    );
    return AidesVeloParTypeAPI.mapToAPI(result);
  }

  // NOTE: this could manage region and departement code as well in the future
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: App.getThrottleLimit(), ttl: 1000 } })
  @ApiOkResponse({ type: Array<AideVeloNonCalculeeAPI> })
  @Post('aides/recupererAideVeloParCodeCommuneOuEPCI')
  @ApiBody({
    type: InputRecupererAideVeloAPI,
  })
  @ApiOperation({
    summary:
      "Récupère l'ensemble des aides vélo disponibile pour une commune ou un EPCI",
    description:
      "Par disponible, on entend que l'aide est disponible pour la commune ou l'EPCI, mais pas nécessairement proposée par cette dernière. Par exemple, une aide proposée par la région est disponible aux habitant:es d'une commune de la région.",
  })
  async recupererAidesVeloParCodeCommuneOuEPCI(
    @Body() body: InputRecupererAideVeloAPI,
  ): Promise<AideVeloNonCalculeeAPI[]> {
    const result =
      await this.aidesUsecase.recupererToutesLesAidesDisponiblesParCommuneOuEPCI(
        body.code_insee_ou_siren,
      );
    return result.map(AideVeloNonCalculeeAPI.mapToAPI);
  }
}
