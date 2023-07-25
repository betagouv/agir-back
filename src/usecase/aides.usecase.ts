import { Injectable } from '@nestjs/common';

import {
  AidesRepository,
  AidesVeloParType,
  AidesRetroFit,
} from '../infrastructure/repository/aides.repository';

@Injectable()
export class AidesUsecase {
  constructor(private aidesRepository: AidesRepository) {}

  async getRetrofit(
    codePostal: string,
    revenuFiscalDeReference: string,
  ): Promise<AidesRetroFit> {
    return this.aidesRepository.getAidesRetrofit(
      codePostal,
      revenuFiscalDeReference,
    );
  }

  async getVelo(
    codePostal: string,
    revenuFiscalDeReference: string,
  ): Promise<AidesVeloParType> {
    return this.aidesRepository.getAidesVelo(
      codePostal,
      revenuFiscalDeReference,
    );
  }
}
