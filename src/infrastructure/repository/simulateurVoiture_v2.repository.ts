import { Injectable } from '@nestjs/common';
import { CarSimulator, Situation } from 'publicodes-voiture-v2';
import { SimulateurVoitureParams_v2 } from 'src/domain/simulateur_voiture/parametres_v2';
import {
  VoitureActuelle_v2,
  VoitureAlternatives_v2,
} from 'src/domain/simulateur_voiture/resultats_v2';

/**
 * Encapsulates the car simulator {@link Situation} and provides
 * a way to update it with type safety.
 *
 * PERF: How extra memory is used by this class in comparison to using a plain object?
 */
export class SimulateurVoitureParamsConstructor_v2 {
  private params: SimulateurVoitureParams_v2;

  constructor(params?: SimulateurVoitureParams_v2) {
    this.params = params ?? {};
  }

  public getSituation(): Situation {
    return this.params;
  }

  /**
   * Type-safe way to set a parameter.
   *
   * @param key The key of the parameter to set.
   * @param value The value to set.
   */
  public set<K extends keyof SimulateurVoitureParams_v2>(
    key: K,
    value: SimulateurVoitureParams_v2[K],
  ) {
    this.params[key] = value;
  }
}

@Injectable()
export class SimulateurVoitureRepository_v2 {
  private simulator: CarSimulator;

  constructor() {
    this.simulator = new CarSimulator();
  }

  /**
   * Returns the computed results for the current car of the given user.
   *
   * @param params The completed set of parameters (e.g. situation, answers) used
   * to compute the results.
   */
  evaluateVoitureActuelle(
    params: SimulateurVoitureParamsConstructor_v2,
  ): VoitureActuelle_v2 {
    const contextualizedEngine = this.simulator
      .shallowCopy()
      .setSituation(params.getSituation());

    return contextualizedEngine.evaluateCar();
  }

  /**
   * Returns the computed results for all the alternatives of the given user.
   *
   * @param params The completed set of parameters (e.g. situation, answers) used
   * to compute the results.
   *
   * @note This is a heavy operation.
   */
  evaluateAlternatives(
    params: SimulateurVoitureParamsConstructor_v2,
  ): VoitureAlternatives_v2 {
    const contextualizedEngine = this.simulator
      .shallowCopy()
      .setSituation(params.getSituation());

    return contextualizedEngine.evaluateAlternatives();
  }
}
