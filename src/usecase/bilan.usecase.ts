import { Injectable } from '@nestjs/common';
import { BilanRepository } from '../infrastructure/repository/bilan.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';

@Injectable()
export class BilanUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private bilanRepository: BilanRepository,
  ) {}
  async getLastBilanByUtilisateurId(utilisateurId: string): Promise<any> {
    const bilan = await this.bilanRepository.getLastBilanByUtilisateurId(
      utilisateurId,
    );

    return bilan;
  }
  async getAllBilansByUtilisateurId(utilisateurId: string): Promise<any> {
    const bilans = await this.bilanRepository.getAllBilansByUtilisateurId(
      utilisateurId,
    );

    return bilans;
  }

  async addBilanToUtilisateur(
    utilisateurId: string,
    situation: string,
  ): Promise<any> {
    const result = await this.bilanRepository.create(situation, utilisateurId);

    return result;
  }
}
