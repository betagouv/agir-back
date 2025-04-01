import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { GamificationUsecase } from '../../../src/usecase/gamification.usecase';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { BoardAPI } from './types/gamification/boardAPI';
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
  @Throttle({ default: { limit: 10, ttl: 2000 } })
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
  @Throttle({ default: { limit: 10, ttl: 2000 } })
  async classementLocal(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<any> {
    this.checkCallerId(req, utilisateurId);
    const board = await this.gamificationUsecase.classementLocal(utilisateurId);
    return BoardAPI.mapToAPI(board, true);
  }

  @Post('utilisateurs/:utilisateurId/gamification/popup_reset_vue')
  @ApiOperation({
    summary: 'indique que la popup de reset a été vue',
  })
  @UseGuards(AuthGuard)
  async popup_reset_vue(
    @Param('utilisateurId') utilisateurId: string,
    @Request() req,
  ) {
    this.checkCallerId(req, utilisateurId);
    await this.gamificationUsecase.popupResetVue(utilisateurId);
  }
}
