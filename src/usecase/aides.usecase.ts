import { Injectable } from '@nestjs/common';

import {
  AidesVeloRepository,
  AidesVeloParType,
} from '../infrastructure/repository/aidesVelo.repository';

import {
  AidesRetrofitRepository,
  AideBase,
} from '../infrastructure/repository/aidesRetrofit.repository';

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
