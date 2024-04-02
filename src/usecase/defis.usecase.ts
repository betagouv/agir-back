import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { Defi, DefiStatus } from '../../src/domain/defis/defi';
import { DefiRepository } from '../../src/infrastructure/repository/defi.repository';

@Injectable()
export class DefisUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private defiRepository: DefiRepository,
  ) {}

  async getALL(): Promise<Defi[]> {
    const all = await this.defiRepository.list();
    return all.map(
      (e) =>
        new Defi({
          ...e,
          status: DefiStatus.todo,
          date_acceptation: null,
          id: e.content_id,
        }),
    );
  }

  async getALLUserDefi(utilisateurId: string): Promise<Defi[]> {
    const user = await this.utilisateurRepository.getById(utilisateurId);
    return user.defi_history.defis;
  }

  async getById(utilisateurId: string, defiId: string): Promise<Defi> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    const catalogue = await this.defiRepository.list();
    utilisateur.defi_history.setCatalogue(catalogue);

    return utilisateur.defi_history.getDefiOrException(defiId);
  }
  async updateStatus(
    utilisateurId: string,
    defiId: string,
    status: DefiStatus,
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    const catalogue = await this.defiRepository.list();
    utilisateur.defi_history.setCatalogue(catalogue);

    utilisateur.defi_history.updateStatus(defiId, status, utilisateur);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }
}
