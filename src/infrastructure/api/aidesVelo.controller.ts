import {
  Body,
  Controller,
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
import { AidesVeloUsecase } from '../../usecase/aidesVelo.usecase';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { AidesVeloParTypeAPI } from './types/aide/AidesVeloParTypeAPI';
import { AideVeloNonCalculeeAPI } from './types/aide/AideVeloNonCalculeesAPI';
import { InputAideVeloAPI } from './types/aide/inputAideVeloAPI';
import { InputAideVeloOpenAPI } from './types/aide/inputAideVeloOpenAPI';
import { InputRecupererAideVeloAPI } from './types/aide/InputRecupererAideVeloAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Aides Vélo')
export class AidesVeloController extends GenericControler {
  constructor(private readonly aidesVeloUsecase: AidesVeloUsecase) {
    super();
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
    const result = await this.aidesVeloUsecase.simulerAideVelo(
      utilisateurId,
      body.prix_du_velo,
      body.etat_du_velo,
      body.situation_handicap,
    );
    return AidesVeloParTypeAPI.mapToAPI(result);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: App.getThrottleLimit(), ttl: 1000 } })
  @ApiOkResponse({ type: AidesVeloParTypeAPI })
  @Post('aides/simulerAideVelo')
  @ApiBody({
    type: InputAideVeloOpenAPI,
    description:
      'DEPRECATED: Utiliser /utilisateurs/:utilisateurId/simulerAideVelo ou /aides/recupererAideVeloParCodeCommuneOuEPCI',
  })
  async simulerAideVelo(
    @Body() body: InputAideVeloOpenAPI,
  ): Promise<AidesVeloParTypeAPI> {
    const result =
      await this.aidesVeloUsecase.simulerAideVeloParCodeCommmuneOuEPCI(
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
      await this.aidesVeloUsecase.recupererToutesLesAidesDisponiblesParCommuneOuEPCI(
        body.code_insee_ou_siren,
      );
    return result.map(AideVeloNonCalculeeAPI.mapToAPI);
  }
}
