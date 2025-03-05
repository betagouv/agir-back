import { Enchainement } from '../../../usecase/questionKYC.usecase';
import { Action } from '../../actions/action';
import { Thematique } from '../thematique';

export class DetailThematique {
  thematique: Thematique;
  enchainement_questions_personnalisation: Enchainement;
  personnalisation_necessaire: boolean;
  liste_actions: Action[];
  nom_commune: string;
  nombre_recettes: number;
  nombre_actions: number;
  nombre_aides: number;
  nombre_simulateurs: number;
}
