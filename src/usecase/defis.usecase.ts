import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { Defi, DefiStatus } from '../../src/domain/defis/defi';
import { DefiRepository } from '../../src/infrastructure/repository/defi.repository';
import { PonderationApplicativeManager } from '../../src/domain/scoring/ponderationApplicative';
import { MissionRepository } from '../../src/infrastructure/repository/mission.repository';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { ThematiqueRepository } from '../../src/infrastructure/repository/thematique.repository';
import { Feature } from '../../src/domain/gamification/feature';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';

@Injectable()
export class DefisUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private defiRepository: DefiRepository,
    private missionRepository: MissionRepository,
    private personnalisator: Personnalisator,
  ) {}

  async getDefisOfUnivers(
    utilisateurId: string,
    univers: string,
  ): Promise<Defi[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();
    const defiDefinitions = await this.defiRepository.list({});
    utilisateur.defi_history.setCatalogue(defiDefinitions);

    let result = await this.getDefisOfUniversAndUtilisateur(
      utilisateur,
      univers,
    );

    result = result.filter((d) => d.getStatus() === DefiStatus.en_cours);

    this.personnalisator.personnaliser(result, utilisateur);

    return result;
  }

  private async getDefisOfUniversAndUtilisateur(
    utilisateur: Utilisateur,
    univers: string,
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
    const defiDefinitions = await this.defiRepository.list({});
    utilisateur.defi_history.setCatalogue(defiDefinitions);

    let result: Defi[] = [];

    const univers_liste = ThematiqueRepository.getAllUnivers();

    for (const univers of univers_liste) {
      const defis_univers = await this.getDefisOfUniversAndUtilisateur(
        utilisateur,
        univers,
      );
      result = result.concat(
        defis_univers.filter((d) => d.getStatus() === DefiStatus.en_cours),
      );
    }
    this.personnalisator.personnaliser(result, utilisateur);

    return result;
  }

  async getALLUserDefi(
    utilisateurId: string,
    filtre_status: DefiStatus[],
    univers: string,
    accessible: boolean,
  ): Promise<Defi[]> {
    let result: Defi[] = [];

    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();
    const defiDefinitions = await this.defiRepository.list({});
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
      this.personnalisator.personnaliser(result, utilisateur);
    }
    result = result.concat(
      utilisateur.defi_history.getDefisOfStatus(filtre_status),
    );

    this.personnalisator.personnaliser(result, utilisateur);

    return result;
  }

  async getById(utilisateurId: string, defiId: string): Promise<Defi> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const catalogue = await this.defiRepository.list({});
    utilisateur.defi_history.setCatalogue(catalogue);

    const defi = utilisateur.defi_history.getDefiOrException(defiId);

    this.personnalisator.personnaliser(defi, utilisateur);

    return defi;
  }
  async updateStatus(
    utilisateurId: string,
    defiId: string,
    status: DefiStatus,
    motif: string,
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const catalogue = await this.defiRepository.list({});
    utilisateur.defi_history.setCatalogue(catalogue);

    utilisateur.defi_history.updateStatus(defiId, status, utilisateur, motif);

    if (status === DefiStatus.en_cours) {
      utilisateur.unlocked_features.add(Feature.defis);
    }

    if (status === DefiStatus.fait) {
      const unlocked_thematiques = utilisateur.missions.validateDefi(
        defiId,
        utilisateur,
      );
      await this.unlockThematiques(unlocked_thematiques, utilisateur);
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async unlockThematiques(
    unlocked_thematiques: string[],
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
