import { Injectable } from '@nestjs/common';

import { CommuneRepository } from '../../src/infrastructure/repository/commune/commune.repository';

@Injectable()
export class CommunesUsecase {
  constructor(private communeRepository: CommuneRepository) {}
  async getListeCommunes(codePostal: string): Promise<string[]> {
    return this.communeRepository.getListCommunesNamesParCodePostal(codePostal);
  }

  async loadAllEpciAndCOmmunes() {
    await this.communeRepository.upsertCommuneAndEpciToDatabase();
  }

  async getListeCommunesAndEPCIByName(
    nom: string,
  ): Promise<{ nom: string; code_insee: string }[]> {
    return await this.communeRepository.findCommuneOrEpciByName(nom);
  }
}
