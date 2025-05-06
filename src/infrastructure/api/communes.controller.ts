import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CommunesUsecase } from '../../../src/usecase/communes.usecase';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';

class CommuneEPCIAPI {
  @ApiProperty() code_insee: string;
  @ApiProperty() nom: string;
}

class CommuneAPI {
  @ApiProperty() code: string;
  @ApiProperty() label: string;
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
    return this.communeUsecase.getListeCommunes(codePostal);
  }

  @ApiOkResponse({ type: [CommuneAPI] })
  @Get('communes_v2')
  @UseGuards(AuthGuard)
  async getListeCommunes_v2(
    @Query('code_postal') codePostal: string,
  ): Promise<CommuneAPI[]> {
    return this.communeUsecase.getListeCommunes_v2(codePostal);
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
