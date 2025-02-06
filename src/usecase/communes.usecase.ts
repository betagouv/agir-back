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
    if (!nom || nom.length < 4) {
      return [];
    }
    const liste_mots = nom.split(' ');
    return await this.communeRepository.findCommuneOrEpciByName(liste_mots);
  }
}
