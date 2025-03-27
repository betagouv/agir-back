import { Injectable } from '@nestjs/common';
import { NGCCalculator } from '../infrastructure/ngc/NGCCalculator';
import { SituationNGCRepository } from '../infrastructure/repository/situationNGC.repository';

@Injectable()
export class ImportNGCUsecase {
  constructor(
    private bilanRepository: SituationNGCRepository,
    private ngcCaclulator: NGCCalculator,
  ) {}

  async importSituationNGC(
    situation: object,
  ): Promise<{ id_situtation: string; bilan_tonnes: number }> {
    const id_situtation = await this.bilanRepository.createSituation(situation);
    let bilan = 8000;
    try {
      bilan =
        this.ngcCaclulator.computeBasicBilanFromSituation(
          situation,
        ).bilan_carbone_annuel;
    } catch (error) {
      console.error(
        `Erreur calcul bilan carbone utilisateur NGC, id_situation : ${id_situtation} ${error}`,
      );
    }
    if (!bilan) {
      console.error(`Bilan import NGC incorrecte : [${bilan}]`);
      bilan = 8000;
    }
    return {
      id_situtation: id_situtation,
      bilan_tonnes: Math.round(bilan / 100) / 10,
    };
  }
}
