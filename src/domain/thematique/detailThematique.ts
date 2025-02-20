import { Enchainement } from '../kyc/questionKYC';
import { Thematique } from './thematique';

export class DetailThematique {
  thematique: Thematique;
  enchainement_questions_personalisation: Enchainement;
  personalisation_necessaire: boolean;
}
