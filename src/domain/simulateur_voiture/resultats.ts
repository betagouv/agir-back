import {
  Alternative,
  EvaluatedCarInfos,
  RuleValue,
  TargetInfos,
} from '@betagouv/publicodes-voiture';

/**
 * Model the aggregated results from the car simulator (see {@link
 * SimulateurVoitureRepository}).
 */
export type SimulateurVoitureResultat = {
  /** Information about the current car. */
  voiture_actuelle: EvaluatedCarInfos;
  /** Information about all the computed alternatives. */
  alternatives: Alternative[];
  /**
   * Information about the target car (i.e. the wanted size and if it's
   * possible to charge electric cars).
   */
  voiture_cible: TargetInfos;
};

/** NOTE: should we want to decouple with a specific implementation ? */
export type VoitureActuelle = EvaluatedCarInfos;
export type VoitureAlternatives = Alternative[];
export type VoitureCible = TargetInfos;

export type VoitureGabarit = RuleValue['voiture . gabarit'];
export type VoitureMotorisation = RuleValue['voiture . motorisation'];
export type VoitureCarburant = RuleValue['voiture . thermique . carburant'];
