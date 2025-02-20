import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Param, UseGuards, Request, Get } from '@nestjs/common';
import { GenericControler } from './genericControler';
import { ThematiqueUsecase } from '../../usecase/thematique.usecase';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { TuileThematiqueAPI } from './types/univers/TuileThematiqueAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Thematiques')
export class ThematiqueController extends GenericControler {
  constructor(private thematiqueUsecase: ThematiqueUsecase) {
    super();
  }

  @Get('thematiques')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 1000 } })
  @ApiOkResponse({
    type: [TuileThematiqueAPI],
  })
  @ApiOperation({
    summary: `Retourne la synthèse des 4 thématiques principales disponibles sur le services`,
  })
  async getCatalogue(): Promise<TuileThematiqueAPI[]> {
    const result =
      await this.thematiqueUsecase.getListeThematiquesPrincipales();
    return result.map((r) => TuileThematiqueAPI.mapToAPI(r));
  }
}
