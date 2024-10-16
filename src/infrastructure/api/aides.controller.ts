import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Request,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AidesUsecase } from '../../usecase/aides.usecase';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AideVeloAPI as AideVeloAPI } from './types/aide/AideVeloAPI';
import { AidesVeloParTypeAPI } from './types/aide/AidesVeloParTypeAPI';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { InputAideVeloAPI } from './types/aide/inputAideVeloAPI';
import { Response } from 'express';
import { AideAPI } from './types/aide/AideAPI';
import { AideAPI_v2 } from './types/aide/AideAPI_v2';

@Controller()
@ApiBearerAuth()
@ApiTags('Aides')
export class AidesController extends GenericControler {
  constructor(private readonly aidesUsecase: AidesUsecase) {
    super();
  }

  /**
  @ApiOkResponse({ type: AideVeloAPI })
  @Get('aides/retrofit')
  @UseGuards(AuthGuard)
  async getRetrofit(
    @Query('codePostal') codePostal: string,
    @Query('revenuFiscalDeReference') revenuFiscalDeReference: string,
  ): Promise<AideVeloAPI[]> {
    const aides = await this.aidesUsecase.getRetrofit(
      codePostal,
      revenuFiscalDeReference,
    );
    // FIXME : retourner liste vide ?
    if (aides.length === 0) {
      throw new NotFoundException(`Pas d'aides pour le retrofit`);
    }
    return aides;
  }
   */

  @ApiOkResponse({ type: [AideAPI] })
  @Get('utilisateurs/:utilisateurId/aides')
  @UseGuards(AuthGuard)
  async getCatalogueAides(
    @Param('utilisateurId') utilisateurId: string,
    @Request() req,
  ): Promise<AideAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const aides = await this.aidesUsecase.getCatalogueAides(utilisateurId);
    return aides.aides.map((elem) => AideAPI.mapToAPI(elem));
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
  ) {
    this.checkCallerId(req, utilisateurId);
    const result = await this.aidesUsecase.simulerAideVelo(
      utilisateurId,
      body.prix_du_velo,
    );
    return result;
  }
}
