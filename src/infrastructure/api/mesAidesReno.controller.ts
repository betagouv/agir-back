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
import { MesAidesRenoUsecase } from '../../usecase/mesAidesReno.usecase';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { MesAidesRenoIframeUrlsAPI } from './types/mes_aides_reno/MesAidesRenoIframeUrlsAPI';
import { SituationMesAidesRenoAPI } from './types/mes_aides_voiture/situationMesAidesRenoAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Mes Aides Réno')
export class MesAidesRenoController extends GenericControler {
  constructor(private readonly mesAidesRenoUsecase: MesAidesRenoUsecase) {
    super();
  }

  @Get('utilisateurs/:utilisateurId/mes_aides_reno/get_iframe_urls')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary:
      "Retourne l'url de l'iframe avec réponses pré-remplies par rapport à la situation de l'utilisateurice",
  })
  @ApiOkResponse({
    type: MesAidesRenoIframeUrlsAPI,
    description:
      "L'url de l'iframe avec les réponses pré-remplies par rapport à la situation de l'utilisateurice",
  })
  async getIframeUrl(
    @Param('utilisateurId') utilisateurId: string,
    @Request() req,
  ): Promise<MesAidesRenoIframeUrlsAPI> {
    this.checkCallerId(req, utilisateurId);
    return await this.mesAidesRenoUsecase.getIframeUrl(utilisateurId);
  }

  @Post('utilisateurs/:utilisateurId/mes_aides_reno/nouvelle_situation')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary:
      "Met à jour la situation de l'utilisateurice avec celle retournée par Mes Aides Réno",
  })
  @ApiBody({
    type: SituationMesAidesRenoAPI,
    description: "La nouvelle situation de l'utilisateurice",
  })
  async setSituation(
    @Param('utilisateurId') utilisateurId: string,
    @Body() body: SituationMesAidesRenoAPI,
    @Request() req,
  ): Promise<void> {
    this.checkCallerId(req, utilisateurId);
    await this.mesAidesRenoUsecase.updateUtilisateurWith(
      utilisateurId,
      body.situation,
    );
  }
}
