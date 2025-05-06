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
import { NiveauRisqueLogement } from '../../domain/logement/NiveauRisque';
import { TypeRisqueLogement } from '../../domain/logement/TypeRisque';
import { RisquesUsecase } from '../../usecase/risques.usecase';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { RisquesAdresseAPI } from './types/risques/risquesAdresseAPI';
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

  @Get('utilisateurs/:utilisateurId/risques_adresse')
  @ApiOperation({
    summary: `Scores de risques principaux liés à l'adresse précise de l'utilisateur`,
  })
  @ApiOkResponse({
    type: [RisquesAdresseAPI],
  })
  @ApiQuery({
    name: 'longitude',
    type: Number,
    required: false,
    description: `optionnel, coordonnées géographique à utiliser en place de celle du profile utilisateur`,
  })
  @ApiQuery({
    name: 'latitude',
    type: Number,
    required: false,
    description: `optionnel, coordonnées géographique à utiliser en place de celle du profile utilisateur`,
  })
  @UseGuards(AuthGuard)
  async risquesAdresseUtilisateur(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Query('longitude') longitude?: number,
    @Query('latitude') latitude?: number,
  ): Promise<RisquesAdresseAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.risquesUsecase.getRisquesAdresseUtilisateur(
      utilisateurId,
      longitude,
      latitude,
    );
    const final_result = [];

    for (const type of Object.values(TypeRisqueLogement)) {
      const score = result[type];
      if (score) {
        final_result.push(RisquesAdresseAPI.mapToAPI(type, score));
      } else {
        final_result.push(
          RisquesAdresseAPI.mapToAPI(type, NiveauRisqueLogement.inconnu),
        );
      }
    }
    return final_result;
  }
}
