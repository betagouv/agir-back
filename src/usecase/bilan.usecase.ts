import { Injectable } from '@nestjs/common';
import { NGCCalculator } from '../infrastructure/ngc/NGCCalculator';
import { BilanRepository } from '../infrastructure/repository/bilan.repository';
import { SituationNGC } from '@prisma/client';

@Injectable()
export class BilanUsecase {
  constructor(
    private bilanRepository: BilanRepository,
    private nGCCalculator: NGCCalculator,
  ) {}

  async addBilanToUtilisateur(
    utilisateurId: string,
    situationId: string,
  ): Promise<boolean> {
    const situation = await this.bilanRepository.getSituationNGCbyId(
      situationId,
    );
    const bilan = this.nGCCalculator.computeBilanFromSituation(
      situation.situation as any,
    );
    const result = await this.bilanRepository.createBilan(
      situationId,
      utilisateurId,
      bilan,
    );
    return result !== null;
  }

  async addSituation(situation: object): Promise<SituationNGC | null> {
    return this.bilanRepository.createSituation(situation);
  }
}
