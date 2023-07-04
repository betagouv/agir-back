import { Injectable } from '@nestjs/common';
import { AidesRepository } from '../../src/infrastructure/repository/aides.repository';

type Aides = {
  libelle: string;
  montant: string;
  plafond: string;
  lien: string;
}[];

@Injectable()
export class AidesUsecase {
  constructor(private aidesRepository: AidesRepository) {}
  async getRetrofit(
    codePostal: string,
    revenuFiscalDeReference: string,
  ): Promise<Aides> {
    return this.aidesRepository.get(
      codePostal,
      revenuFiscalDeReference,
      'retrofit',
    );
  }
  async getVelo(
    codePostal: string,
    revenuFiscalDeReference: string,
  ): Promise<Aides> {
    return this.aidesRepository.get(
      codePostal,
      revenuFiscalDeReference,
      'velo',
    );
  }
}
