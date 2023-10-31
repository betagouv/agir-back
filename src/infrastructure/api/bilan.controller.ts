import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BilanUsecase } from '../../usecase/bilan.usecase';
import { BilanAPI } from './types/ngc/bilanAPI';
import { SituationNGCAPI } from './types/ngc/situationNGCAPI';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';

@Controller()
@ApiTags('Bilan')
export class BilanController extends GenericControler {
  constructor(private readonly bilanUsecase: BilanUsecase) {
    super();
  }
  @ApiOkResponse({ type: BilanAPI })
  @Get('utilisateur/:utilisateurId/bilans/last')
  @UseGuards(AuthGuard)
  async getBilan(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<BilanAPI> {
    this.checkCallerId(req, utilisateurId);
    return this.bilanUsecase.getLastBilanByUtilisateurId(utilisateurId);
  }

  @Get('utilisateur/:utilisateurId/bilans')
  @ApiOkResponse({ type: BilanAPI })
  @UseGuards(AuthGuard)
  async getBilans(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<BilanAPI[]> {
    this.checkCallerId(req, utilisateurId);
    return this.bilanUsecase.getAllBilansByUtilisateurId(utilisateurId);
  }

  @Post('utilisateurs/:utilisateurId/bilans/:situationId')
  @UseGuards(AuthGuard)
  async postEmpreinte(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('situationId') situationId: string,
  ): Promise<any> {
    this.checkCallerId(req, utilisateurId);
    return await this.bilanUsecase.addBilanToUtilisateur(
      utilisateurId,
      situationId,
    );
  }

  @ApiBody({
    schema: {
      type: 'object',
    },
  })
  @Post('bilan/importFromNGC')
  async importFromNGC(
    @Body() body: { situation: object },
  ): Promise<SituationNGCAPI> {
    // todo : check situation for security
    const result = await this.bilanUsecase.addSituation(body.situation);
    return result as SituationNGCAPI;
  }
}

/*
string de test pour le swagger:
{ "transport . voiture . propriétaire": "'false'","transport . voiture . gabarit": "'SUV'","transport . voiture . motorisation": "'thermique'",   "alimentation . boisson . chaude . café . nombre": 4,   "transport . voiture . thermique . carburant": "'essence E85'" }
*/
