import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Param, UseGuards, Request, Get } from '@nestjs/common';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { UniversAPI } from './types/univers/UniversAPI';
import { ThematiqueUniversAPI } from './types/univers/ThematiqueUniversAPI';
import { MissionUsecase } from '../../usecase/mission.usecase';
import { Thematique } from '../../domain/contenu/thematique';
import { ThematiqueRepository } from '../repository/thematique.repository';
import { ThematiqueDefinition } from '../../domain/thematique/thematiqueDefinition';

@Controller()
@ApiBearerAuth()
@ApiTags('Univers')
export class UniversController extends GenericControler {
  constructor(private missionUsecase: MissionUsecase) {
    super();
  }

  @Get('utilisateurs/:utilisateurId/thematiques_recommandees')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: [ThematiqueUniversAPI],
  })
  @ApiOperation({
    deprecated: true,
    summary: `DEPRECATED : Retourne les thematiques recommandées pour la home`,
  })
  async getThematiquesRecommandees(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<ThematiqueUniversAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result =
      await this.missionUsecase.getTuilesMissionsRecommandeesToutesThematiques(
        utilisateurId,
      );
    return result.map((e) => ThematiqueUniversAPI.mapToAPI(e));
  }
}
