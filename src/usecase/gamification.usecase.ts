import { Injectable } from '@nestjs/common';

import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { Stats } from '../../src/domain/stats';
import { CelebrationType } from '../../src/infrastructure/api/types/gamification/celebration';

@Injectable()
export class GamificationUsecase {
  constructor(private utilisateurRepository: UtilisateurRepository) {}

  async getStats(utilisateurId: string): Promise<Stats> {
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    return {
      points: utilisateur.points,
      niveau: 1,
      current_points_in_niveau: 5,
      point_target_in_niveau: 7,
      celebrations: [{ type: CelebrationType.niveau, id: '1', new_niveau: 2 }],
    };
  }
}
