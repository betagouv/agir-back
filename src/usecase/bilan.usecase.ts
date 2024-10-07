import { Injectable } from '@nestjs/common';
import { SituationNGCRepository } from '../infrastructure/repository/bilan.repository';
import { NGCCalculator } from '../infrastructure/ngc/NGCCalculator';

@Injectable()
export class BilanUsecase {
  constructor(
    private bilanRepository: SituationNGCRepository,
    private ngcCaclulator: NGCCalculator,
  ) {}

  async importSituationNGC(
    situation: object,
  ): Promise<{ id_situtation: string; bilan_tonnes: number }> {
    const id_situtation = await this.bilanRepository.createSituation(situation);
    let bilan = { bilan_carbone_annuel: 8000 };
    try {
      bilan = this.ngcCaclulator.computeBilanFromSituation(situation);
    } catch (error) {
      console.error(
        `Erreur calcul bilan carbone utilisateur NGC, id_situation : ${id_situtation}`,
      );
    }
    return {
      id_situtation: id_situtation,
      bilan_tonnes: Math.round(bilan.bilan_carbone_annuel / 1000),
    };
  }
}
