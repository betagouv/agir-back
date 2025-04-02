import { Injectable } from '@nestjs/common';
import { Defi, DefiStatus } from '../../src/domain/defis/defi';
import { Feature } from '../../src/domain/gamification/feature';
import { Scope, Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { ThematiqueRepository } from '../../src/infrastructure/repository/thematique.repository';
import { Thematique } from '../domain/thematique/thematique';
import { ApplicationError } from '../infrastructure/applicationError';
import {
  CLE_PERSO,
  Personnalisator,
} from '../infrastructure/personnalisation/personnalisator';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';

@Injectable()
export class DefisUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private personnalisator: Personnalisator,
  ) {}

  async getAllDefis_v2(
    utilisateurId: string,
    thematique: Thematique,
    filtre_status: string[],
  ): Promise<Defi[]> {
    if (filtre_status.length > 0) {
      for (const status of filtre_status) {
        if (!DefiStatus[status]) {
          ApplicationError.throwUnknownDefiStatus(status);
        }
      }
    } else {
      filtre_status = [
        DefiStatus.pas_envie,
        DefiStatus.fait,
        DefiStatus.en_cours,
        DefiStatus.abondon,
      ];
    }

    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.defis, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    let result: Defi[] = [];

    let filtre_thematiques: Thematique[];
    if (thematique) {
      filtre_thematiques = [thematique];
    } else {
      filtre_thematiques = ThematiqueRepository.getAllThematiques();
    }

    for (const thematique of filtre_thematiques) {
      const defis_univers = null;
      result = result.concat(
        defis_univers.filter((d) => filtre_status.includes(d.getStatus())),
      );
    }
    return this.personnalisator.personnaliser(result, utilisateur, [
      CLE_PERSO.block_text_cms,
    ]);
  }

  async getById(utilisateurId: string, defiId: string): Promise<Defi> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.defis, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const defi = utilisateur.defi_history.getDefiOrException(defiId);

    return this.personnalisator.personnaliser(defi, utilisateur, [
      CLE_PERSO.block_text_cms,
    ]);
  }
  async updateStatus(
    utilisateurId: string,
    defiId: string,
    status: DefiStatus,
    motif: string,
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.defis, Scope.unlocked_features, Scope.gamification],
    );
    Utilisateur.checkState(utilisateur);

    utilisateur.defi_history.updateStatus(defiId, status, utilisateur, motif);

    if (status === DefiStatus.en_cours) {
      if (!utilisateur.unlocked_features.isUnlocked(Feature.defis)) {
        utilisateur.unlocked_features.add(Feature.defis);
      }
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }
}
