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
import { AidesVeloParType, AideBase } from 'src/domain/aides/aide';

@Controller()
@ApiTags('Aides')
export class AidesController {
  constructor(private readonly aidesUsecase: AidesUsecase) {}

  @Get('aides/retrofit')
  async getRetrofit(
    @Query('codePostal') codePostal: string,
    @Query('revenuFiscalDeReference') revenuFiscalDeReference: string,
  ): Promise<AideBase[]> {
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
  ): Promise<AidesVeloParType> {
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
