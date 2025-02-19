import { CarSimulator, Situation } from '@betagouv/publicodes-voiture';
import { Injectable } from '@nestjs/common';
import { SimulateurVoitureParams } from 'src/domain/simulateur_voiture/parametres';
import {
  VoitureActuelle,
  VoitureAlternatives,
  VoitureCible,
} from '../../domain/simulateur_voiture/resultats';

/**
 * Encapsulates the car simulator {@link Situation} and provides
 * a way to update it with type safety.
 *
 * PERF: How extra memory is used by this class in comparison to using a plain object?
 */
export class SimulateurVoitureParamsConstructor {
  private params: SimulateurVoitureParams;

  constructor(params?: SimulateurVoitureParams) {
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
  public set<K extends keyof SimulateurVoitureParams>(
    key: K,
    value: SimulateurVoitureParams[K],
  ) {
    this.params[key] = value;
  }
}

@Injectable()
export class SimulateurVoitureRepository {
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
    params: SimulateurVoitureParamsConstructor,
  ): VoitureActuelle {
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
    params: SimulateurVoitureParamsConstructor,
  ): VoitureAlternatives {
    const contextualizedEngine = this.simulator
      .shallowCopy()
      .setSituation(params.getSituation());

    return contextualizedEngine.evaluateAlternatives();
  }

  /**
   * Returns the computed results for the target car of the given user.
   *
   * @param params The completed set of parameters (e.g. situation, answers) used
   * to compute the results.
   */
  evaluateVoitureCible(
    params: SimulateurVoitureParamsConstructor,
  ): VoitureCible {
    const contextualizedEngine = this.simulator
      .shallowCopy()
      .setSituation(params.getSituation());

    return contextualizedEngine.evaluateTargetCar();
  }
}
