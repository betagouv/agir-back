import { Injectable } from '@nestjs/common';
import { SituationNGCRepository } from '../infrastructure/repository/bilan.repository';

@Injectable()
export class BilanUsecase {
  constructor(private bilanRepository: SituationNGCRepository) {}

  async importSituationNGC(situation: object): Promise<string> {
    return await this.bilanRepository.createSituation(situation);
  }
}
