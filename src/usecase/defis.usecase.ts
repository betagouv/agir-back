import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { Defi, DefiStatus } from '../../src/domain/defis/defi';
import { DefiRepository } from '../../src/infrastructure/repository/defi.repository';
import { PonderationApplicativeManager } from '../../src/domain/scoring/ponderationApplicative';
import { Univers } from '../../src/domain/univers/univers';
import { MissionRepository } from '../../src/infrastructure/repository/mission.repository';
import { ThematiqueUnivers } from '../../src/domain/univers/thematiqueUnivers';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';

@Injectable()
export class DefisUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private defiRepository: DefiRepository,
    private missionRepository: MissionRepository,
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
  async getDefisOfUnivers(
    utilisateurId: string,
    univers: Univers,
  ): Promise<Defi[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();
    const defiDefinitions = await this.defiRepository.list();
    utilisateur.defi_history.setCatalogue(defiDefinitions);

    const result = await this.getDefisOfUniversAndUtilisateur(
      utilisateur,
      univers,
    );

    return result.filter(
      (d) =>
        d.getStatus() === DefiStatus.todo ||
        d.getStatus() === DefiStatus.en_cours,
    );
  }

  private async getDefisOfUniversAndUtilisateur(
    utilisateur: Utilisateur,
    univers: Univers,
  ): Promise<Defi[]> {
    const list_defi_ids =
      utilisateur.missions.getAllUnlockedDefisIdsByUnivers(univers);

    const result: Defi[] = [];

    for (const id_defi of list_defi_ids) {
      result.push(utilisateur.defi_history.getDefiOrException(id_defi));
    }
    return result;
  }

  async getAllDefis_v2(utilisateurId: string): Promise<Defi[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();
    const defiDefinitions = await this.defiRepository.list();
    utilisateur.defi_history.setCatalogue(defiDefinitions);

    let result: Defi[] = [];

    for (const univers of Object.values(Univers)) {
      const defis_univers = await this.getDefisOfUniversAndUtilisateur(
        utilisateur,
        univers,
      );
      result = result.concat(
        defis_univers.filter(
          (d) =>
            d.getStatus() === DefiStatus.todo ||
            d.getStatus() === DefiStatus.en_cours,
        ),
      );
    }
    return result;
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
        utilisateur.defi_history.getDefisRestants(undefined, univers),
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

    const unlocked_thematiques = utilisateur.missions.validateDefi(
      defiId,
      utilisateur,
    );

    await this.unlockThematiques(unlocked_thematiques, utilisateur);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async unlockThematiques(
    unlocked_thematiques: ThematiqueUnivers[],
    utilisateur: Utilisateur,
  ) {
    for (const thematiqueU of unlocked_thematiques) {
      const mission_def = await this.missionRepository.getByThematique(
        thematiqueU,
      );
      utilisateur.missions.addNewVisibleMission(mission_def);
    }
  }
}
