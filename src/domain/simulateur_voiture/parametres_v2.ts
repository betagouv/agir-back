import { Questions, Situation } from 'publicodes-voiture-v2';

/**
 * Subsets of the {@link Situation} corresponding to {@link Questions} (i.e.
 * parameters) in the * car simulator.
 */
export type SimulateurVoitureParams_v2 = Pick<Situation, keyof Questions>;
export type RegleSimulateurVoiture_v2 = keyof SimulateurVoitureParams_v2;
