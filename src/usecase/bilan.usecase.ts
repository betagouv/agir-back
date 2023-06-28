import { Injectable } from '@nestjs/common';
import { BilanRepository } from '../infrastructure/repository/bilan.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';

@Injectable()
export class BilanUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private bilanRepository: BilanRepository,
  ) {}
  async getBilanForUser(utilisateurId: string): Promise<any> {
    const situation = await this.bilanRepository.getSituationforUserId(
      utilisateurId,
    );

    const result = this.bilanRepository.evaluateSituation(situation);

    return result;
  }

  async addBilanForUser(utilisateurId: string, situation: string): Promise<any> {

    const result = await this.bilanRepository.create(situation, utilisateurId);

    return result;
  }
}
