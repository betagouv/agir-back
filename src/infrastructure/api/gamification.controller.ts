import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  Post,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { Response } from 'express';
import { ApplicationError } from '../applicationError';
import { GamificationUsecase } from '../../../src/usecase/gamification.usecase';
import { GamificationAPI } from './types/gamification/gamificationAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Gamification')
export class GamificationController extends GenericControler {
  constructor(private readonly gamificationUsecase: GamificationUsecase) {
    super();
  }

  @Get('utilisateurs/:utilisateurId/gamification')
  @ApiOperation({
    summary:
      'renvoie les données relatives à la gamification (score, niveaux, badges, etc)',
  })
  @ApiOkResponse({ type: GamificationAPI })
  @UseGuards(AuthGuard)
  async getUtilisateurGamification(
    @Param('utilisateurId') utilisateurId: string,
    @Request() req,
  ): Promise<GamificationAPI> {
    this.checkCallerId(req, utilisateurId);

    const result = await this.gamificationUsecase.getGamificationData(utilisateurId);

    return GamificationAPI.mapToStatsAPI(result);
  }
}
