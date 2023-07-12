import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Param, Body, Headers } from '@nestjs/common';
import { BilanUsecase } from '../../usecase/bilan.usecase';

@Controller()
@ApiTags('Bilan')
export class BilanController {
  constructor(private readonly bilanUsecase: BilanUsecase) {}
  @Get('utilisateur/:utilisateurId/bilans/last')
  async getBilan(@Param('utilisateurId') utilisateurId: string): Promise<any> {
    const bilan = await this.bilanUsecase.getLastBilanByUtilisateurId(
      utilisateurId,
    );

    return bilan;
  }

  @Get('utilisateur/:utilisateurId/bilans')
  async getBilans(@Param('utilisateurId') utilisateurId: string): Promise<any> {
    const bilan = await this.bilanUsecase.getAllBilansByUtilisateurId(
      utilisateurId,
    );

    return bilan;
  }

  @Post('bilan')
  async postEmpreinte(
    @Headers('utilisateurId') utilisateurId: string,
    @Headers('situation') situation: string,
  ): Promise<any> {
    const result = await this.bilanUsecase.addBilanToUtilisateur(
      utilisateurId,
      situation,
    );

    return result;
  }
}

/*
string de test pour le swagger:
{ "transport . voiture . propriétaire": "'false'","transport . voiture . gabarit": "'SUV'","transport . voiture . motorisation": "'thermique'",   "alimentation . boisson . chaude . café . nombre": 4,   "transport . voiture . thermique . carburant": "'essence E85'" }
*/
