import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { Defi, DefiStatus } from '../../src/domain/defis/defi';
import { CatalogueDefis } from '../../src/domain/defis/catalogueDefis';

@Injectable()
export class DefisUsecase {
  constructor(private utilisateurRepository: UtilisateurRepository) {}

  async getALL(): Promise<Defi[]> {
    return CatalogueDefis.getAll();
  }
  async getById(utilisateurId: string, defiId: string): Promise<Defi> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    return utilisateur.defi_history.getDefiOrException(defiId);
  }
  async updateStatus(
    utilisateurId: string,
    defiId: string,
    status: DefiStatus,
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    const defi = utilisateur.defi_history.getDefiForUpdate(defiId);

    defi.setStatus(status);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }
}
