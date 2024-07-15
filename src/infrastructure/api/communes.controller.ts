import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { CommunesUsecase } from '../../../src/usecase/communes.usecase';

@Controller()
@ApiTags('Referentiels')
export class CommunesController extends GenericControler {
  constructor(private readonly communeUscase: CommunesUsecase) {
    super();
  }

  @ApiOkResponse({ type: [String] })
  @Get('communes')
  async getListeCommunes(
    @Query('code_postal') codePostal: string,
  ): Promise<string[]> {
    return this.communeUscase.geteListeCommunes(codePostal);
  }
}
