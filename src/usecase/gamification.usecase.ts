import { Injectable } from '@nestjs/common';

import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { Gamification } from '../domain/gamification/gamification';
import { UtilisateurBoardRepository } from '../infrastructure/repository/utilisateurBoard.repository';
import { Board } from '../domain/gamification/board';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';

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

  async classement(utilisateurId: string): Promise<Board> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    let result = [];

    const top_trois = await this.utilisateurBoardRepository.top_trois();

    let top_trois_commune = null;
    if (utilisateur.logement.code_postal) {
      top_trois_commune =
        await this.utilisateurBoardRepository.top_trois_commune(
          utilisateur.logement.code_postal,
          utilisateur.logement.commune,
        );
    }

    const classement_utilisateur =
      await this.utilisateurBoardRepository.classement_utilisateur(
        utilisateurId,
      );

    if (!classement_utilisateur || classement_utilisateur.rank === null) {
      return {
        classement_local: {
          pourcentile: null,
          top_trois: top_trois_commune,
          utilisateur: null,
          classement_utilisateur: null,
          code_postal: utilisateur.logement.code_postal,
          commune_label: this.communeRepository.formatCommune(
            utilisateur.logement.code_postal,
            utilisateur.logement.commune,
          ),
        },
        classement_national: {
          pourcentile: null,
          top_trois: top_trois,
          utilisateur: null,
          classement_utilisateur: null,
        },
      };
    }

    const users_avant_national =
      await this.utilisateurBoardRepository.utilisateur_classement_proximite(
        classement_utilisateur.rank,
        4,
        'avant',
        'national',
        undefined,
        undefined,
        utilisateur.id,
      );
    const users_apres_national =
      await this.utilisateurBoardRepository.utilisateur_classement_proximite(
        classement_utilisateur.rank,
        4,
        'apres',
        'national',
        undefined,
        undefined,
        utilisateur.id,
      );

    const users_avant_local =
      await this.utilisateurBoardRepository.utilisateur_classement_proximite(
        classement_utilisateur.rank,
        4,
        'avant',
        'local',
        utilisateur.logement.code_postal,
        utilisateur.logement.commune,
        utilisateur.id,
      );
    const users_apres_local =
      await this.utilisateurBoardRepository.utilisateur_classement_proximite(
        classement_utilisateur.rank,
        4,
        'apres',
        'local',
        utilisateur.logement.code_postal,
        utilisateur.logement.commune,
        utilisateur.id,
      );

    const pourcentile_national =
      await this.utilisateurBoardRepository.getPourcentile(
        utilisateur.gamification.points,
      );
    const pourcentile_local = utilisateur.logement.code_postal
      ? await this.utilisateurBoardRepository.getPourcentile(
          utilisateur.gamification.points,
          utilisateur.logement.code_postal,
          utilisateur.logement.commune,
        )
      : null;

    return {
      classement_national: {
        pourcentile: pourcentile_national,
        top_trois: top_trois,
        utilisateur: classement_utilisateur,
        classement_utilisateur: [].concat(
          users_avant_national,
          [classement_utilisateur],
          users_apres_national,
        ),
      },
      classement_local: {
        pourcentile: pourcentile_local,
        top_trois: top_trois_commune,
        utilisateur: classement_utilisateur,
        classement_utilisateur: [].concat(
          users_avant_local,
          [classement_utilisateur],
          users_apres_local,
        ),
        code_postal: utilisateur.logement.code_postal,
        commune_label: this.communeRepository.formatCommune(
          utilisateur.logement.code_postal,
          utilisateur.logement.commune,
        ),
      },
    };
  }

  async compute_classement(): Promise<void> {
    const user_id_liste = await this.utilisateurRepository.listUtilisateurIds();

    for (const user_id of user_id_liste) {
      const utilisateur = await this.utilisateurRepository.getById(user_id);
      await this.utilisateurBoardRepository.upsert({
        code_postal: utilisateur.logement.code_postal,
        commune: utilisateur.logement.commune,
        points: utilisateur.gamification.points,
        prenom: utilisateur.prenom,
        utilisateurId: user_id,
      });
    }

    await this.utilisateurBoardRepository.update_rank_france();
    await this.utilisateurBoardRepository.update_rank_commune();
  }
}
