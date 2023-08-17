import { Injectable } from '@nestjs/common';
import { Aide } from '../../src/domain/aide';
import { AidesRepository } from '../infrastructure/repository/aides.repository';

@Injectable()
export class AidesUsecase {
  constructor(private aidesRepository: AidesRepository) {}
  async getRetrofit(
    codePostal: string,
    revenuFiscalDeReference: string,
  ): Promise<Aide[]> {
    return this.aidesRepository.get(
      codePostal,
      revenuFiscalDeReference,
      'retrofit',
    );
  }
  async getVelo(
    codePostal: string,
    revenuFiscalDeReference: string,
  ): Promise<Aide[]> {
    return this.aidesRepository.get(
      codePostal,
      revenuFiscalDeReference,
      'velo',
    );
  }
}
