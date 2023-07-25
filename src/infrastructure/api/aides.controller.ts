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
import {
  AidesVeloParType,
  AidesRetroFit,
} from '../repository/aides.repository';

@Controller()
@ApiTags('Aides')
export class AidesController {
  constructor(private readonly aidesUsecase: AidesUsecase) {}

  @Get('aides/retrofit')
  async getRetrofit(
    @Query('codePostal') codePostal: string,
    @Query('revenuFiscalDeReference') revenuFiscalDeReference: string,
  ): Promise<AidesRetroFit> {
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

  @Get('aides/velo')
  async getvelo(
    @Query('codePostal') codePostal: string,
    @Query('revenuFiscalDeReference') revenuFiscalDeReference: string,
  ): Promise<AidesVeloParType> {
    const aides = await this.aidesUsecase.getVelo(
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
