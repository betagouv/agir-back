import { Injectable } from '@nestjs/common';
import { Pick } from '@prisma/client/runtime/library.js';
import {
  CarSimulator,
  Questions,
  CarInfos,
} from '@betagouv/publicodes-voiture';

/**
 * Required parameters to get the summary of the aids for the different types
 * of bikes.
 *
 * @note This is a subset of the {@link Questions} type.
 */
export type SimulateurVoitureParams = Required<
  Pick<
    Questions,
    | 'localisation . code insee'
    | 'localisation . epci'
    | 'localisation . région'
    | 'localisation . département'
    | 'vélo . prix'
    | 'aides . pays de la loire . abonné TER'
    | 'foyer . personnes'
    | 'revenu fiscal de référence par part . revenu de référence'
    | 'revenu fiscal de référence par part . nombre de parts'
  >
>;

/**
 * Computed results from the {@link CarSimulator}.
 */
export type SimulateurVoitureResults = {
  /** The computed results for the current user car. */
  user: CarInfos;
};

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
  async getResults(
    params: SimulateurVoitureParams,
  ): Promise<SimulateurVoitureResults> {
    const contextualizedEngine = this.simulator.shallowCopy().setInputs(params);

    return {
      user: contextualizedEngine.evaluateCar(),
    };
  }
}
