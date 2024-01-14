import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { RecommandationAPI } from './types/recommandationAPI';
import { RecommandationUsecase } from '../../../src/usecase/recommandation.usecase';

@Controller()
@ApiBearerAuth()
@ApiTags('Recommandation')
export class RecommandationsController extends GenericControler {
  constructor(private readonly recommandationUsecase: RecommandationUsecase) {
    super();
  }

  @Get('utilisateurs/:utilisateurId/recommandations')
  @ApiOkResponse({ type: [RecommandationAPI] })
  @UseGuards(AuthGuard)
  async getUserRecommandation(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<RecommandationAPI[]> {
    this.checkCallerId(req, utilisateurId);

    const list = await this.recommandationUsecase.listRecommandations(
      utilisateurId,
    );
    return list.map((reco) => RecommandationAPI.mapToAPI(reco));
  }
}
