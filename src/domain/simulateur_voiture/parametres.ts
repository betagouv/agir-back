import { Questions, Situation } from '@betagouv/publicodes-voiture';

/**
 * Subsets of the {@link Situation} corresponding to {@link Questions} (i.e.
 * parameters) in the * car simulator.
 */
export type SimulateurVoitureParams = Pick<Situation, keyof Questions>;
export type RegleSimulateurVoiture = keyof SimulateurVoitureParams;
