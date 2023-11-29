import { Injectable } from '@nestjs/common';

import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { Gamification } from '../domain/gamification';

@Injectable()
export class GamificationUsecase {
  constructor(private utilisateurRepository: UtilisateurRepository) {}

  async getStats(utilisateurId: string): Promise<Gamification> {
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    return {
      points: utilisateur.gamification.points,
      niveau: utilisateur.gamification.niveau,
      current_points_in_niveau:
        utilisateur.gamification.current_points_in_niveau,
      point_target_in_niveau: utilisateur.gamification.point_target_in_niveau,
      celebrations: utilisateur.gamification.celebrations,
    };
  }
}
