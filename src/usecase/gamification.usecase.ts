import { Injectable } from '@nestjs/common';

import { Board } from '../domain/gamification/board';
import { Classement } from '../domain/gamification/classement';
import { Gamification } from '../domain/gamification/gamification';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { UtilisateurBoardRepository } from '../infrastructure/repository/utilisateurBoard.repository';

@Injectable()
export class GamificationUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private utilisateurBoardRepository: UtilisateurBoardRepository,
    private communeRepository: CommuneRepository,
  ) {}

  async getGamificationData(utilisateurId: string): Promise<Gamification> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.gamification],
    );
    Utilisateur.checkState(utilisateur);

    return utilisateur.gamification;
  }
  async popupResetVue(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.gamification],
    );
    Utilisateur.checkState(utilisateur);

    utilisateur.gamification.setPopupResetVue(utilisateur);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.gamification, Scope.core],
    );
  }

  async classementLocal(utilisateurId: string): Promise<Board> {
    await this.utilisateurBoardRepository.update_rank_user_commune_V2();

    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.gamification, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    let top_trois_commune: Classement[] = null;
    if (utilisateur.code_commune_classement) {
      top_trois_commune =
        await this.utilisateurBoardRepository.top_trois_commune_user(
          utilisateur.code_commune_classement,
          utilisateur.id,
        );
      this.fixTop3Ranks(top_trois_commune);
    }

    if (utilisateur.rank_commune === null) {
      return {
        pourcentile: null,
        top_trois: top_trois_commune,
        utilisateur: null,
        classement_utilisateur: null,
        code_postal: utilisateur.logement.code_postal,
        commune_label: this.communeRepository.getCommuneByCodeINSEE(
          utilisateur.code_commune_classement,
        )?.nom,
        badges: utilisateur.gamification.getBadges(),
      };
    }

    const users_avant_local =
      await this.utilisateurBoardRepository.utilisateur_classement_proximite_V2(
        utilisateur.points_classement,
        4,
        'rank_avant_strict',
        'local',
        utilisateur.code_commune_classement,
        utilisateur.id,
      );
    const users_apres_local =
      await this.utilisateurBoardRepository.utilisateur_classement_proximite_V2(
        utilisateur.points_classement,
        4,
        'rank_apres_ou_egal',
        'local',
        utilisateur.code_commune_classement,
        utilisateur.id,
      );

    const pourcentile_local = utilisateur.code_commune_classement
      ? await this.utilisateurBoardRepository.getPourcentile(
          utilisateur.points_classement,
          utilisateur.code_commune_classement,
        )
      : null;

    const classement_utilisateur =
      this.buildClassementFromUtilisateur(utilisateur);

    this.setProperRanksForUsers(
      users_avant_local,
      classement_utilisateur,
      true,
      true,
    );
    this.setProperRanksForUsers(
      users_apres_local,
      classement_utilisateur,
      false,
      true,
    );

    return {
      pourcentile: pourcentile_local,
      top_trois: top_trois_commune,
      utilisateur: classement_utilisateur,
      classement_utilisateur: [].concat(
        users_avant_local,
        [classement_utilisateur],
        users_apres_local,
      ),
      code_postal: utilisateur.logement.code_postal,
      commune_label: this.communeRepository.getCommuneByCodeINSEE(
        utilisateur.code_commune_classement,
      )?.nom,
      badges: utilisateur.gamification.getBadges(),
    };
  }

  async classementNational(utilisateurId: string): Promise<Board> {
    await this.utilisateurBoardRepository.update_rank_user_france_V2();

    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.gamification],
    );
    Utilisateur.checkState(utilisateur);

    const top_trois = await this.utilisateurBoardRepository.top_trois_user(
      utilisateur.id,
    );

    this.fixTop3Ranks(top_trois);

    if (utilisateur.rank === null) {
      return {
        pourcentile: null,
        top_trois: top_trois,
        utilisateur: null,
        classement_utilisateur: null,
        code_postal: null,
        commune_label: null,
        badges: utilisateur.gamification.getBadges(),
      };
    }

    const users_avant_national =
      await this.utilisateurBoardRepository.utilisateur_classement_proximite_V2(
        utilisateur.points_classement,
        4,
        'rank_avant_strict',
        'national',
        undefined,
        utilisateur.id,
      );
    const users_apres_national =
      await this.utilisateurBoardRepository.utilisateur_classement_proximite_V2(
        utilisateur.points_classement,
        4,
        'rank_apres_ou_egal',
        'national',
        undefined,
        utilisateur.id,
      );

    const pourcentile_national =
      await this.utilisateurBoardRepository.getPourcentile(
        utilisateur.points_classement,
      );

    const classement_utilisateur =
      this.buildClassementFromUtilisateur(utilisateur);

    this.setProperRanksForUsers(
      users_avant_national,
      classement_utilisateur,
      true,
      false,
    );
    this.setProperRanksForUsers(
      users_apres_national,
      classement_utilisateur,
      false,
      false,
    );

    return {
      pourcentile: pourcentile_national,
      top_trois: top_trois,
      utilisateur: classement_utilisateur,
      classement_utilisateur: [].concat(
        users_avant_national,
        [classement_utilisateur],
        users_apres_national,
      ),
      code_postal: null,
      commune_label: null,
      badges: utilisateur.gamification.getBadges(),
    };
  }

  private buildClassementFromUtilisateur(utilisateur: Utilisateur): Classement {
    return new Classement({
      code_commune: utilisateur.code_commune_classement,
      points: utilisateur.points_classement,
      pseudo: utilisateur.pseudo,
      utilisateurId: utilisateur.id,
      rank: utilisateur.rank,
      rank_commune: utilisateur.rank_commune,
    });
  }

  private fixTop3Ranks(top_3: Classement[]) {
    if (top_3[0]) {
      top_3[0].rank = 1;
      top_3[0].rank_commune = 1;
    }
    if (top_3[1]) {
      top_3[1].rank = 2;
      top_3[1].rank_commune = 2;
    }
    if (top_3[2]) {
      top_3[2].rank = 3;
      top_3[2].rank_commune = 3;
    }
  }
  private setProperRanksForUsers(
    classements: Classement[],
    user_classement: Classement,
    avant: boolean,
    local: boolean,
  ) {
    let increment = 0;
    if (avant) {
      for (let index = classements.length - 1; index >= 0; index--) {
        increment--;
        const element = classements[index];
        if (local) {
          element.rank_commune = user_classement.rank_commune + increment;
        } else {
          element.rank = user_classement.rank + increment;
        }
      }
    } else {
      for (const element of classements) {
        increment++;
        if (local) {
          element.rank_commune = user_classement.rank_commune + increment;
        } else {
          element.rank = user_classement.rank + increment;
        }
      }
    }
  }
}
