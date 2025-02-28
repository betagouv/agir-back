import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Scope, Utilisateur } from '../../../domain/utilisateur/utilisateur';
import { StatistiqueExternalRepository } from '../../../infrastructure/repository/statitstique.external.repository';
import { UtilisateurRepository } from '../../../infrastructure/repository/utilisateur/utilisateur.repository';

@Injectable()
export class DuplicateUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private statistiqueExternalRepository: StatistiqueExternalRepository,
  ) {}

  async duplicateUtilisateur(block_size: number = 50) {
    const total_user_count = await this.utilisateurRepository.countAll();

    await this.statistiqueExternalRepository.deleteAllUserData();

    for (let index = 0; index < total_user_count; index = index + block_size) {
      const current_user_list =
        await this.utilisateurRepository.listePaginatedUsers(
          index,
          block_size,
          [Scope.logement, Scope.gamification],
        );

      for (const user of current_user_list) {
        await this.updateExternalStatIdIfNeeded(user);
        await this.statistiqueExternalRepository.createUserData(user);
      }
    }
  }

  private async updateExternalStatIdIfNeeded(utilisateur: Utilisateur) {
    if (!utilisateur.external_stat_id) {
      utilisateur.external_stat_id = uuidv4();
      await this.utilisateurRepository.updateUtilisateurExternalStatId(
        utilisateur.id,
        utilisateur.external_stat_id,
      );
    }
  }
}
