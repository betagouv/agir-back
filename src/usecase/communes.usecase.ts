import { Injectable } from '@nestjs/common';

import { CommuneRepository } from '../../src/infrastructure/repository/commune/commune.repository';

@Injectable()
export class CommunesUsecase {
  constructor(private communeRepository: CommuneRepository) {}
  async getListeCommunes(codePostal: string): Promise<string[]> {
    return this.communeRepository.getListCommunesParCodePostal(codePostal);
  }

  async loadAllEpciAndCOmmunes() {
    await this.communeRepository.upsertCommuneAndEpciToDatabase();
  }
}
