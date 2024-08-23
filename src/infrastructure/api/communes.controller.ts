import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { CommunesUsecase } from '../../../src/usecase/communes.usecase';
import { AuthGuard } from '../auth/guard';

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
}
