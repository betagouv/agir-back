import { Thematique } from '../thematique/thematique';

export class FAQDefinition {
  cms_id: string;
  question: string;
  reponse: string;
  thematique: Thematique;

  constructor(data: FAQDefinition) {
    Object.assign(this, data);
  }
}
