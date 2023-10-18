import {
  Controller,
  Get,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AidesUsecase } from '../../usecase/aides.usecase';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AideAPI } from './types/AideAPI';
import { AidesVeloParTypeAPI } from './types/AidesVeloParTypeAPI';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';

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
  @UseGuards(AuthGuard)
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
