import { Injectable } from '@nestjs/common';

import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { Gamification } from '../domain/gamification/gamification';
import { UtilisateurBoardRepository } from '../infrastructure/repository/utilisateurBoard.repository';
import { Board } from '../domain/gamification/board';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import { Classement } from '../domain/gamification/classement';
import { Utilisateur } from '../domain/utilisateur/utilisateur';

@Injectable()
export class GamificationUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private utilisateurBoardRepository: UtilisateurBoardRepository,
    private communeRepository: CommuneRepository,
  ) {}

  async getGamificationData(utilisateurId: string): Promise<Gamification> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    return utilisateur.gamification;
  }

  async classementLocal(utilisateurId: string): Promise<Board> {
    await this.utilisateurBoardRepository.update_rank_user_commune();

    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    let top_trois_commune = null;
    if (utilisateur.code_postal_classement) {
      top_trois_commune =
        await this.utilisateurBoardRepository.top_trois_commune_user(
          utilisateur.code_postal_classement,
          utilisateur.commune_classement,
        );
    }

    if (utilisateur.rank_commune === null) {
      return {
        pourcentile: null,
        top_trois: top_trois_commune,
        utilisateur: null,
        classement_utilisateur: null,
        code_postal: utilisateur.code_postal_classement,
        commune_label: this.communeRepository.formatCommune(
          utilisateur.code_postal_classement,
          utilisateur.commune_classement,
        ),
      };
    }

    const users_avant_local =
      await this.utilisateurBoardRepository.utilisateur_classement_proximite(
        utilisateur.rank_commune,
        4,
        'rank_avant_strict',
        'local',
        utilisateur.code_postal_classement,
        utilisateur.commune_classement,
        utilisateur.id,
      );
    const users_apres_local =
      await this.utilisateurBoardRepository.utilisateur_classement_proximite(
        utilisateur.rank_commune,
        4,
        'rank_apres_ou_egal',
        'local',
        utilisateur.code_postal_classement,
        utilisateur.commune_classement,
        utilisateur.id,
      );

    const pourcentile_local = utilisateur.code_postal_classement
      ? await this.utilisateurBoardRepository.getPourcentile(
          utilisateur.points_classement,
          utilisateur.code_postal_classement,
          utilisateur.commune_classement,
        )
      : null;

    const classement_utilisateur =
      this.buildClassementFromUtilisateur(utilisateur);

    return {
      pourcentile: pourcentile_local,
      top_trois: top_trois_commune,
      utilisateur: classement_utilisateur,
      classement_utilisateur: [].concat(
        users_avant_local,
        [classement_utilisateur],
        users_apres_local,
      ),
      code_postal: utilisateur.code_postal_classement,
      commune_label: this.communeRepository.formatCommune(
        utilisateur.code_postal_classement,
        utilisateur.commune_classement,
      ),
    };
  }

  async classementNational(utilisateurId: string): Promise<Board> {
    await this.utilisateurBoardRepository.update_rank_user_france();

    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const top_trois = await this.utilisateurBoardRepository.top_trois_user();

    if (utilisateur.rank === null) {
      return {
        pourcentile: null,
        top_trois: top_trois,
        utilisateur: null,
        classement_utilisateur: null,
        code_postal: null,
        commune_label: null,
      };
    }

    const users_avant_national =
      await this.utilisateurBoardRepository.utilisateur_classement_proximite(
        utilisateur.rank,
        4,
        'rank_avant_strict',
        'national',
        undefined,
        undefined,
        utilisateur.id,
      );
    const users_apres_national =
      await this.utilisateurBoardRepository.utilisateur_classement_proximite(
        utilisateur.rank,
        4,
        'rank_apres_ou_egal',
        'national',
        undefined,
        undefined,
        utilisateur.id,
      );

    const pourcentile_national =
      await this.utilisateurBoardRepository.getPourcentile(
        utilisateur.points_classement,
      );

    const classement_utilisateur =
      this.buildClassementFromUtilisateur(utilisateur);

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
    };
  }

  private buildClassementFromUtilisateur(utilisateur: Utilisateur): Classement {
    return new Classement({
      code_postal: utilisateur.code_postal_classement,
      commune: utilisateur.commune_classement,
      points: utilisateur.points_classement,
      prenom: utilisateur.prenom,
      utilisateurId: utilisateur.id,
      rank: utilisateur.rank,
      rank_commune: utilisateur.rank_commune,
    });
  }
}
