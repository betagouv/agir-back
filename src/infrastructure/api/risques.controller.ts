import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RisquesUsecase } from '../../usecase/risques.usecase';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { RisquesCommuneAPI } from './types/risques/risquesCommuneAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('2 - Risques')
export class RisqesController extends GenericControler {
  constructor(private readonly risquesUsecase: RisquesUsecase) {
    super();
  }

  @Get('utilisateurs/:utilisateurId/risques_commune')
  @ApiOperation({
    summary:
      "Risques principaux liés à la commune d'habitation de l'utilisateur",
  })
  @ApiOkResponse({
    type: RisquesCommuneAPI,
  })
  @ApiQuery({
    name: 'code_commune',
    type: String,
    required: false,
    description: `optionnel, code de commune à utiliser en place du code de commune utilisateur`,
  })
  @UseGuards(AuthGuard)
  async risquesCommuneUtilisateur(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Query('code_commune') code_commune?: string,
  ): Promise<RisquesCommuneAPI> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.risquesUsecase.getRisquesCommuneUtilisateur(
      utilisateurId,
      code_commune,
    );

    return RisquesCommuneAPI.mapToAPI(result);
  }
}
