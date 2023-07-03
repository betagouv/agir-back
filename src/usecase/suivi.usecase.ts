import { Injectable } from '@nestjs/common';
import { SuiviRepository } from '../infrastructure/repository/suivi.repository';
import { Suivi } from '../domain/suivi/suivi';
import { SuiviCollection } from '../../src/domain/suivi/suiviCollection';
import { StdioNull } from 'child_process';

@Injectable()
export class SuiviUsecase {
  constructor(private suiviRepository: SuiviRepository) {}

  async createSuivi(suivi: Suivi, utilisateurId: string): Promise<string> {
    return this.suiviRepository.createSuivi(suivi, utilisateurId);
  }
  async listeSuivi(
    utilisateurId: string,
    type?: string,
  ): Promise<SuiviCollection> {
    return this.suiviRepository.listAllSuivi(utilisateurId, type);
  }
  async getLastSuivi(utilisateurId: string, type?: string): Promise<Suivi | null> {
    return this.suiviRepository.getLastSuivi(utilisateurId, type);
  }
}
