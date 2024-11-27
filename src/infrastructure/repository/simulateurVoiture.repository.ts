import { Injectable } from '@nestjs/common';
import { Pick } from '@prisma/client/runtime/library.js';
import { CarSimulator, Questions } from '@betagouv/publicodes-voiture';

import { SimulateurVoitureResultat } from 'src/domain/simulateur_voiture/resultats';

/**
 * Required parameters to get the results of the car simulator.
 *
 * @note This is a subset of the {@link Questions} type.
 *
 * TODO: determine all the required parameters.
 */
export type SimulateurVoitureParams = Required<
  Pick<Questions, 'voiture . gabarit'>
>;

@Injectable()
export class SimulateurVoitureRepository {
  private simulator: CarSimulator;

  constructor() {
    this.simulator = new CarSimulator();
  }

  /**
   * Returns the computed results for the given parameters.
   *
   * @param params The completed set of parameters (e.g. situation, answers) used
   * to compute the results.
   *
   * @note This is a heavy operation.
   */
  async getResultat(
    params: SimulateurVoitureParams,
  ): Promise<SimulateurVoitureResultat> {
    const contextualizedEngine = this.simulator.shallowCopy().setInputs(params);

    return {
      voiture_actuelle: contextualizedEngine.evaluateCar(),
      alternatives: contextualizedEngine.evaluateAlternatives(),
      voiture_cible: contextualizedEngine.evaluateTargetCar(),
    };
  }
}
