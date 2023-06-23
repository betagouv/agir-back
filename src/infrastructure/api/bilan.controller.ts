import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Param, Body, Headers } from '@nestjs/common';
import { BilanUsecase } from '../../usecase/bilan.usecase';

@Controller()
@ApiTags('Bilan')
export class BilanController {
  constructor(private readonly bilanUsecase: BilanUsecase) {}
  @Get('bilan/:username')
  async getBilan(@Param('username') username: string): Promise<any> {
    const bilan = await this.bilanUsecase.getBilanForUser(username);

    return { bilan };
  }

  @Post('bilan')
  async postEmpreinte(
    @Headers('username') username: string,
    @Headers('situation') situation: string,
  ): Promise<any> {
    const bilan = await this.bilanUsecase.addBilanForUser(username, situation);

    return bilan;
  }
}

/*
string de test pour le swagger:
{ "transport . voiture . propriétaire": "'false'","transport . voiture . gabarit": "'SUV'","transport . voiture . motorisation": "'thermique'",   "alimentation . boisson . chaude . café . nombre": 4,   "transport . voiture . thermique . carburant": "'essence E85'" }
*/
