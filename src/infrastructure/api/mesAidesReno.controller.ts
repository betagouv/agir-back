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

@Controller()
@ApiBearerAuth()
@ApiTags('Mes Aides Réno')
export class MesAidesRenoController extends GenericControler {
  constructor(private readonly mesAidesRenoUsecase: MesAidesRenoUsecase) {
    super();
  }

  @Get('utilisateurs/:utilisateurId/mes_aides_reno/iframe_url')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary:
      "Retourne l'url de l'iframe avec réponses pré-remplies par rapport à la situation de l'utilisateurice",
  })
  @ApiOkResponse({
    type: String,
    description:
      "L'url de l'iframe avec les réponses pré-remplies par rapport à la situation de l'utilisateurice",
  })
  async getIframeUrl(
    @Param('utilisateurId') utilisateurId: string,
    @Request() req,
  ): Promise<string> {
    this.checkCallerId(req, utilisateurId);
    return await this.mesAidesRenoUsecase.getIframeUrl(utilisateurId);
  }

  @Post('utilisateurs/:utilisateurId/mes_aides_reno/nouvelles_situation')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary:
      "Met à jour la situation de l'utilisateurice avec celle retournée par Mes Aides Réno",
  })
  @ApiBody({
    type: [Object],
    description: 'La nouvelle situation de l utilisateurice',
  })
  async setSituation(
    @Param('utilisateurId') utilisateurId: string,
    @Body() nouvellesSituations: Record<string, string>,
    @Request() req,
  ): Promise<void> {
    this.checkCallerId(req, utilisateurId);
    await this.mesAidesRenoUsecase.updateUtilisateurWith(
      utilisateurId,
      nouvellesSituations,
    );
  }
}
