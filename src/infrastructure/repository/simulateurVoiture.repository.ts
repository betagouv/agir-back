import {
  CarSimulator,
  Questions,
  Situation,
} from '@betagouv/publicodes-voiture';
import { Injectable } from '@nestjs/common';

import { SimulateurVoitureResultat } from 'src/domain/simulateur_voiture/resultats';

/**
 * Required parameters to get the results of the car simulator.
 *
 * @note This is a subset of the {@link Questions} type.
 *
 * TODO: determine all the required parameters.
 */
export type SimulateurVoitureParams = Situation;
// Pick<
//   Situation,
//   'voiture . gabarit' | 'voiture . motorisation'
//
//   //>
// >;

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
    const contextualizedEngine = this.simulator
      .shallowCopy()
      .setSituation(params);

    return {
      voiture_actuelle: contextualizedEngine.evaluateCar(),
      alternatives: contextualizedEngine.evaluateAlternatives(),
      voiture_cible: contextualizedEngine.evaluateTargetCar(),
    };
  }
}
