import { Injectable } from '@nestjs/common';
import { BilanRepository } from 'src/infrastructure/repository/bilan.repository';
import { UtilisateurRepository } from 'src/infrastructure/repository/utilisateur.repository';
import { Situation } from 'src/infrastructure/api/types/bilan';

@Injectable()
export class BilanUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private bilanRepository: BilanRepository,
  ) {}
  async getBilanForUser(username: string): Promise<any> {
    const utilisateurId = (
      await this.utilisateurRepository.findFirstUtilisateursByName(username)
    ).id;
    const situation = await this.bilanRepository.getSituationforUserId(
      utilisateurId,
    );

    const result = this.bilanRepository.evaluateSituation(situation);

    return result;
  }

  async addBilanForUser(username: string, situation: string): Promise<any> {
    const utilisateurId = (
      await this.utilisateurRepository.findFirstUtilisateursByName(username)
    ).id;

    const result = await this.bilanRepository.create(situation, utilisateurId);

    return result;
  }
}
