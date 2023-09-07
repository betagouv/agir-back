import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { AidesUsecase } from '../../usecase/aides.usecase';
import { ApiTags } from '@nestjs/swagger';
import { AideAPI } from './types/AideAPI';
import { AidesVeloParTypeAPI } from './types/AidesVeloParTypeAPI';

@Controller()
@ApiTags('Aides')
export class AidesController {
  constructor(private readonly aidesUsecase: AidesUsecase) {}

  @Get('aides/retrofit')
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

  @Get('aides/velos')
  async getAllVelos(
    @Query('codePostal') codePostal: string,
    @Query('revenuFiscalDeReference') revenuFiscalDeReference: string,
  ): Promise<AidesVeloParTypeAPI> {
    const aides = await this.aidesUsecase.getSummaryVelos(
      codePostal,
      revenuFiscalDeReference,
    );
    // FIXME : retourner liste vide ?
    if (!aides) {
      throw new NotFoundException(`Pas d'aides pour le vélo`);
    }
    return aides;
  }
}
