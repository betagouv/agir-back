import {
  Alternative,
  EvaluatedCarInfos,
  RuleValue,
  TargetInfos,
} from 'publicodes-voiture-v2';

/**
 * Model the aggregated results from the car simulator (see {@link
 * SimulateurVoitureRepository}).
 */
export type SimulateurVoitureResultat_v2 = {
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
export type VoitureActuelle_v2 = EvaluatedCarInfos;
export type VoitureAlternatives_v2 = Alternative[];
export type VoitureCible_v2 = TargetInfos;

export type VoitureGabarit_v2 = RuleValue['voiture . gabarit'];
export type VoitureMotorisation_v2 = RuleValue['voiture . motorisation'];
export type VoitureCarburant_v2 = RuleValue['voiture . thermique . carburant'];
