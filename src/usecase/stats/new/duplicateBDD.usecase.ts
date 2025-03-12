import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Scope, Utilisateur } from '../../../domain/utilisateur/utilisateur';
import { StatistiqueExternalRepository } from '../../../infrastructure/repository/statitstique.external.repository';
import { UtilisateurRepository } from '../../../infrastructure/repository/utilisateur/utilisateur.repository';

@Injectable()
export class DuplicateBDDForStatsUsecase {
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
        try {
          await this.statistiqueExternalRepository.createUserData(user);
        } catch (error) {
          console.error(error);
          console.error(`Error Creating User : ${JSON.stringify(user)}`);
        }
      }
    }
  }

  async duplicateKYC(block_size: number = 50) {
    const total_user_count = await this.utilisateurRepository.countAll();

    await this.statistiqueExternalRepository.deleteAllKYCData();

    for (let index = 0; index < total_user_count; index = index + block_size) {
      const current_user_list =
        await this.utilisateurRepository.listePaginatedUsers(
          index,
          block_size,
          [Scope.kyc],
        );

      for (const user of current_user_list) {
        await this.updateExternalStatIdIfNeeded(user);

        const liste_kyc = user.kyc_history.getRawAnsweredKYCs();
        for (const kyc of liste_kyc) {
          try {
            await this.statistiqueExternalRepository.createKYCData(
              user.external_stat_id,
              kyc,
            );
          } catch (error) {
            console.error(error);
            console.error(`Error Creating KYC : ${JSON.stringify(kyc)}`);
          }
        }
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
