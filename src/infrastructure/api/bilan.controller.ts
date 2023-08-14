import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Param, Body, Headers } from '@nestjs/common';
import { BilanUsecase } from '../../usecase/bilan.usecase';
import { BilanExtra } from '../../../src/domain/bilan/bilanExtra';
import { SituationNGC } from '@prisma/client';

@Controller()
@ApiTags('Bilan')
export class BilanController {
  constructor(private readonly bilanUsecase: BilanUsecase) {}
  @Get('utilisateur/:utilisateurId/bilans/last')
  async getBilan(
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<BilanExtra> {
    return this.bilanUsecase.getLastBilanByUtilisateurId(utilisateurId);
  }

  @Get('utilisateur/:utilisateurId/bilans')
  async getBilans(
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<BilanExtra[]> {
    return this.bilanUsecase.getAllBilansByUtilisateurId(utilisateurId);
  }

  @Post('utilisateurs/:utilisateurId/bilans')
  async postEmpreinte(
    @Headers('utilisateurId') utilisateurId: string,
    @Headers('situationId') situationId: string,
  ): Promise<any> {
    return this.bilanUsecase.addBilanToUtilisateur(utilisateurId, situationId);
  }

  @Post('bilan/importFromNGC')
  async importFromNGC(
    @Body() body: { situation: object },
  ): Promise<SituationNGC> {
    // todo : check situation for security
    return this.bilanUsecase.addSituation(body.situation);
  }
}

/*
string de test pour le swagger:
{ "transport . voiture . propriétaire": "'false'","transport . voiture . gabarit": "'SUV'","transport . voiture . motorisation": "'thermique'",   "alimentation . boisson . chaude . café . nombre": 4,   "transport . voiture . thermique . carburant": "'essence E85'" }
*/
