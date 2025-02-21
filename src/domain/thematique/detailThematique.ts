import { Enchainement } from '../kyc/questionKYC';
import { Thematique } from './thematique';

export class DetailThematique {
  thematique: Thematique;
  enchainement_questions_personnalisation: Enchainement;
  personnalisation_necessaire: boolean;
}
