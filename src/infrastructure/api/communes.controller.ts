import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { CommunesUsecase } from '../../../src/usecase/communes.usecase';
import { AuthGuard } from '../auth/guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

export class CommuneEPCIAPI {
  @ApiProperty() code_insee: string;
  @ApiProperty() nom: string;
}

@Controller()
@ApiTags('Referentiels')
@ApiBearerAuth()
export class CommunesController extends GenericControler {
  constructor(private readonly communeUsecase: CommunesUsecase) {
    super();
  }

  @ApiOkResponse({ type: [String] })
  @Get('communes')
  @UseGuards(AuthGuard)
  async getListeCommunes(
    @Query('code_postal') codePostal: string,
  ): Promise<string[]> {
    return await this.communeUsecase.getListeCommunes(codePostal);
  }

  @ApiOkResponse({ type: [CommuneEPCIAPI] })
  @Get('communes_epci')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 1000 } })
  async getListeCommunesEpci(
    @Query('nom') nom: string,
  ): Promise<CommuneEPCIAPI[]> {
    return await this.communeUsecase.getListeCommunesAndEPCIByName(nom);
  }
}
