import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { GamificationUsecase } from '../../../src/usecase/gamification.usecase';
import { GamificationAPI } from './types/gamification/gamificationAPI';
import { BoardAPI } from './types/gamification/boardAPI';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

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

    const result = await this.gamificationUsecase.getGamificationData(
      utilisateurId,
    );

    return GamificationAPI.mapToAPI(result);
  }

  @Get('utilisateurs/:utilisateurId/classement/national')
  @ApiOkResponse({
    type: BoardAPI,
  })
  @ApiOperation({
    summary: `Retourne le classement de l'utilisateur ainsi que le top 3 à l'échelle nationale`,
  })
  @UseGuards(AuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 1000 } })
  async classementNational(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<any> {
    this.checkCallerId(req, utilisateurId);
    const board = await this.gamificationUsecase.classementNational(
      utilisateurId,
    );
    return BoardAPI.mapToAPI(board, false);
  }

  @Get('utilisateurs/:utilisateurId/classement/local')
  @ApiOkResponse({
    type: BoardAPI,
  })
  @ApiOperation({
    summary: `Retourne le classement de l'utilisateur ainsi que le top 3 dans sa commune`,
  })
  @UseGuards(AuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 1000 } })
  async classementLocal(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<any> {
    this.checkCallerId(req, utilisateurId);
    const board = await this.gamificationUsecase.classementLocal(utilisateurId);
    return BoardAPI.mapToAPI(board, true);
  }
}
