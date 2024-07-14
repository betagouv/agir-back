import { Classement } from './classement';

export enum Pourcentile {
  pourcent_5 = 'pourcent_5',
  pourcent_10 = 'pourcent_10',
  pourcent_25 = 'pourcent_25',
  pourcent_50 = 'pourcent_50',
}

export class Board {
  pourcentile: Pourcentile;
  top_trois: Classement[];
  utilisateur: Classement;
  classement_utilisateur: Classement[];
  code_postal: string;
  commune_label: string;
}
