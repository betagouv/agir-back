import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AidesUsecase } from '../../usecase/aides.usecase';
import { ApiBody, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  AideAPI,
  nbPartsDTO,
  prixVeloDTO,
  revenuFiscalDeReferenceDTO,
} from './types/aide/AideAPI';
import { AidesVeloParTypeAPI } from './types/aide/AidesVeloParTypeAPI';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { InputAideVeloAPI } from './types/aide/inputAideVeloAPI';
import { Response } from 'express';

@Controller()
@ApiTags('Aides')
export class AidesController extends GenericControler {
  constructor(private readonly aidesUsecase: AidesUsecase) {
    super();
  }

  @ApiOkResponse({ type: AideAPI })
  @Get('aides/retrofit')
  @UseGuards(AuthGuard)
  async getRetrofit(
    @Query('codePostal') codePostal: string,
    @Query('revenuFiscalDeReference') revenuFiscalDeReference: string,
  ): Promise<AideAPI[]> {
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

  @ApiOkResponse({ type: AidesVeloParTypeAPI })
  @Get('aides/velos')
  @ApiQuery({ name: 'prixVelo', type: prixVeloDTO })
  @ApiQuery({ name: 'nbParts', type: nbPartsDTO })
  @ApiQuery({
    name: 'revenuFiscalDeReference',
    type: revenuFiscalDeReferenceDTO,
  })
  @UseGuards(AuthGuard)
  async getAllVelos(
    @Query('codePostal') codePostal: string,
    @Query('prixVelo') prixVelo: 10000,
    @Query('nbParts') nbParts: 1,
    @Query('revenuFiscalDeReference') revenuFiscalDeReference: 1,
  ): Promise<AidesVeloParTypeAPI> {
    // FIXME AIDE : pas de règles de gestion - à la volée - dans un controller
    const aides = await this.aidesUsecase.getSummaryVelos(
      codePostal,
      revenuFiscalDeReference,
      nbParts,
      prixVelo,
    );
    // FIXME : retourner liste vide ?
    if (!aides) {
      throw new NotFoundException(`Pas d'aides pour le vélo`);
    }
    return aides;
  }

  @ApiOkResponse({ type: AidesVeloParTypeAPI })
  @Post('utilisateurs/:utilisateurId/simulerAideVelo')
  @ApiBody({
    type: InputAideVeloAPI,
  })
  @UseGuards(AuthGuard)
  async getAllVelosByUtilisateur(
    @Param('utilisateurId') utilisateurId: string,
    @Res() res: Response,

    @Body() body: InputAideVeloAPI,
  ) {
    const result = await this.aidesUsecase.simulerAideVeloV2(
      utilisateurId,
      body.prix_du_velo,
    );
    return res.status(HttpStatus.OK).json(result).send();
  }
}
