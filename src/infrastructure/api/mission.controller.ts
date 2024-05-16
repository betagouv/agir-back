import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Put,
  Param,
  Body,
  UseGuards,
  Response,
  Request,
  Get,
  HttpStatus,
  UseFilters,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { ThematiqueUnivers } from '../../../src/domain/univers/thematiqueUnivers';
import { MissionAPI } from './types/mission/MissionAPI';
import { MissionUsecase } from '../../../src/usecase/mission.usecase';

@Controller()
@ApiBearerAuth()
@ApiTags('Mission')
export class MissionController extends GenericControler {
  constructor(private missionUsecase: MissionUsecase) {
    super();
  }

  @Get('utilisateurs/:utilisateurId/thematiques/:thematique/mission')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: MissionAPI,
  })
  @ApiParam({
    name: 'thematique',
    enum: ThematiqueUnivers,
    enumName: 'thematique',
    required: true,
    description: `la thématique`,
  })
  @ApiParam({
    name: 'utilisateurId',
    type: String,
    required: true,
    description: `id de l'utilisateur`,
  })
  @ApiOperation({
    summary: `Retourne la mission de la thématique`,
  })
  async getMission(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('thematique') thematique: ThematiqueUnivers,
  ): Promise<MissionAPI> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.missionUsecase.getMissionOfThematique(
      utilisateurId,
      thematique,
    );
    return MissionAPI.mapToAPI(result);
  }
}
