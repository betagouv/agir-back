import { Injectable } from '@nestjs/common';

import { AidesVeloRepository } from '../infrastructure/repository/aidesVelo.repository';

import { AidesRetrofitRepository } from '../infrastructure/repository/aidesRetrofit.repository';

import { AidesVeloParType, AideBase } from 'src/domain/aides/aide';

@Injectable()
export class AidesUsecase {
  constructor(
    private aidesVeloRepository: AidesVeloRepository,
    private aidesRetrofitRepository: AidesRetrofitRepository,
  ) {}
  async getRetrofit(
    codePostal: string,
    revenuFiscalDeReference: string,
  ): Promise<AideBase[]> {
    return this.aidesRetrofitRepository.get(
      codePostal,
      revenuFiscalDeReference,
    );
  }

  async getSummaryVelos(
    codePostal: string,
    revenuFiscalDeReference: string,
  ): Promise<AidesVeloParType> {
    return this.aidesVeloRepository.getSummaryVelos(
      codePostal,
      revenuFiscalDeReference,
    );
  }
}
