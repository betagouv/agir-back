import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Param, Body, Headers } from '@nestjs/common';
import { BilanUsecase } from '../../usecase/bilan.usecase';
import { BilanAPI } from './types/bilanAPI';
import { SituationNGCAPI } from './types/situationNGCAPI';

@Controller()
@ApiTags('Bilan')
export class BilanController {
  constructor(private readonly bilanUsecase: BilanUsecase) {}
  @Get('utilisateur/:utilisateurId/bilans/last')
  async getBilan(
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<BilanAPI> {
    return this.bilanUsecase.getLastBilanByUtilisateurId(utilisateurId);
  }

  @Get('utilisateur/:utilisateurId/bilans')
  async getBilans(
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<BilanAPI[]> {
    return this.bilanUsecase.getAllBilansByUtilisateurId(utilisateurId);
  }

  @Post('utilisateurs/:utilisateurId/bilans/:situationId')
  async postEmpreinte(
    @Param('utilisateurId') utilisateurId: string,
    @Param('situationId') situationId: string,
  ): Promise<any> {
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
