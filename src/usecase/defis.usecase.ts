import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { Defi, DefiStatus } from '../../src/domain/defis/defi';
import { DefiRepository } from '../../src/infrastructure/repository/defi.repository';
import { PonderationApplicativeManager } from '../../src/domain/scoring/ponderationApplicative';
import { Univers } from '../../src/domain/univers/univers';

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
          status: undefined,
          date_acceptation: undefined,
          id: e.content_id,
          accessible: undefined,
          motif: undefined,
        }),
    );
  }

  async getALLUserDefi(
    utilisateurId: string,
    filtre_status: DefiStatus[],
    univers: Univers,
    accessible: boolean,
  ): Promise<Defi[]> {
    let result = [];

    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();
    const defiDefinitions = await this.defiRepository.list();
    utilisateur.defi_history.setCatalogue(defiDefinitions);

    if (
      (filtre_status.includes(DefiStatus.todo) || filtre_status.length === 0) &&
      !accessible
    ) {
      result = result.concat(
        utilisateur.defi_history.getDefisRestants(univers),
      );

      PonderationApplicativeManager.increaseScoreContentOfList(
        result,
        utilisateur.tag_ponderation_set,
      );

      PonderationApplicativeManager.sortContent(result);

      result = result.filter((d) => d.score > -50);
    }
    result = result.concat(
      utilisateur.defi_history.getDefisOfStatus(filtre_status),
    );
    return result;
  }

  async getById(utilisateurId: string, defiId: string): Promise<Defi> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const catalogue = await this.defiRepository.list();
    utilisateur.defi_history.setCatalogue(catalogue);

    return utilisateur.defi_history.getDefiOrException(defiId);
  }
  async updateStatus(
    utilisateurId: string,
    defiId: string,
    status: DefiStatus,
    motif: string,
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const catalogue = await this.defiRepository.list();
    utilisateur.defi_history.setCatalogue(catalogue);

    utilisateur.defi_history.updateStatus(defiId, status, utilisateur, motif);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }
}
