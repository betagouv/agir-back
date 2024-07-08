import { Pourcetile } from '../../infrastructure/api/types/gamification/boardAPI';
import { Classement } from './classement';

export class ClassementLocal {
  pourcentile: Pourcetile;
  top_trois: Classement[];
  utilisateur: Classement;
  classement_utilisateur: Classement[];
  code_postal: string;
  commune_label: string;
}
export class ClassementNational {
  pourcentile: Pourcetile;
  top_trois: Classement[];
  utilisateur: Classement;
  classement_utilisateur: Classement[];
}

export class Board {
  classement_local: ClassementLocal;
  classement_national: ClassementNational;
}
