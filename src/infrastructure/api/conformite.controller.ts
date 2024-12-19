import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { ConformiteUsecase } from '../../usecase/conformite.usecase';
import { ConformiteAPI } from './types/contenu/conformiteAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Conformite')
export class ConformiteController extends GenericControler {
  constructor(private confoUsecase: ConformiteUsecase) {
    super();
  }
  @Get('pages_conformite/:code')
  @ApiOkResponse({ type: ConformiteAPI })
  @ApiOperation({
    summary: `Renvoie la page de conformite de code donné`,
  })
  async getPageConfomrite(@Param('code') code: string): Promise<ConformiteAPI> {
    return await this.confoUsecase.getPageConfiormite(code);
  }
}
