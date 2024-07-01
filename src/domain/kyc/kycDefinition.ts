import { Categorie } from '../contenu/categorie';
import { Thematique } from '../contenu/thematique';
import { Tag } from '../scoring/tag';
import { TypeReponseQuestionKYC } from './questionKYC';

export class KycDefinition {
  id_cms: number;
  code: string;
  type: TypeReponseQuestionKYC;
  categorie: Categorie;
  points: number;
  is_ngc: boolean;
  question: string;
  reponses?: { label: string; code: string }[];
  thematique: Thematique;
  tags: Tag[];
  universes: string[];

  constructor(data: KycDefinition) {
    this.id_cms = data.id_cms;
    this.code = data.code;
    this.type = data.type;
    this.points = data.points;
    this.categorie = data.categorie;
    this.is_ngc = data.is_ngc;
    this.question = data.question;
    this.reponses = data.reponses ? data.reponses : [];
    this.thematique = data.thematique;
    this.tags = data.tags ? data.tags : [];
    this.universes = data.universes ? data.universes : [];
  }
}
