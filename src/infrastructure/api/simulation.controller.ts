import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { BilanUsecase } from '../../usecase/bilan.usecase';

type Situation = Record<string, string | number | Record<string, unknown>>;

@Controller()
export class SimulationController {
  constructor(private readonly bilanUsecase: BilanUsecase) {}
  @ApiExcludeEndpoint()
  @Get('simulation')
  async getBilan(): Promise<any> {
    const simulation: Situation = {
      'transport . voiture . propriétaire': "'false'",
      'transport . voiture . gabarit': "'SUV'",
      'transport . voiture . motorisation': "'thermique'",
      'alimentation . boisson . chaude . café . nombre': 4,
      'transport . voiture . thermique . carburant': "'essence E85'",
    };

    const bilan = await this.bilanUsecase.getBilan(simulation);

    return bilan;
  }
}
