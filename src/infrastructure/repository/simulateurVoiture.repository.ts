import {
  CarSimulator,
  Questions,
  Situation,
} from '@betagouv/publicodes-voiture';
import { Injectable } from '@nestjs/common';

import {
  VoitureActuelle,
  VoitureAlternatives,
  VoitureCible,
} from 'src/domain/simulateur_voiture/resultats';

/**
 * Subsets of the {@link Situation} corresponding to {@link Questions} (i.e.
 * parameters) in the * car simulator.
 */
type Params = Pick<Situation, keyof Questions>;

/**
 * Encapsulates the car simulator {@link Situation} and provides
 * a way to update it with type safety.
 *
 * PERF: How extra memory is used by this class in comparison to using a plain object?
 */
export class SimulateurVoitureParams {
  private params: Params;

  constructor(params?: Params) {
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
  public set<K extends keyof Params>(key: K, value: Params[K]) {
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
  evaluateVoitureActuelle(params: SimulateurVoitureParams): VoitureActuelle {
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
  evaluateAlternatives(params: SimulateurVoitureParams): VoitureAlternatives {
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
  evaluateVoitureCible(params: SimulateurVoitureParams): VoitureCible {
    const contextualizedEngine = this.simulator
      .shallowCopy()
      .setSituation(params.getSituation());

    return contextualizedEngine.evaluateTargetCar();
  }
}
