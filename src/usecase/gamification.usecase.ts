import { Injectable } from '@nestjs/common';

import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { Gamification } from '../domain/gamification';

@Injectable()
export class GamificationUsecase {
  constructor(private utilisateurRepository: UtilisateurRepository) {}

  async getGamificationData(utilisateurId: string): Promise<Gamification> {
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    return utilisateur.gamification;
  }
}
