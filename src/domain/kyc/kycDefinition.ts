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
  ngc_key: string;
  question: string;
  short_question: string;
  reponses?: { label: string; code: string; ngc_code?: string }[];
  thematique: Thematique;
  tags: Tag[];
  universes: string[];
  image_url: string;

  constructor(data: KycDefinition) {
    this.id_cms = data.id_cms;
    this.code = data.code;
    this.type = data.type;
    this.points = data.points;
    this.categorie = data.categorie;
    this.is_ngc = data.is_ngc;
    this.ngc_key = data.ngc_key;
    this.question = data.question;
    this.reponses = data.reponses ? data.reponses : [];
    this.thematique = data.thematique;
    this.tags = data.tags ? data.tags : [];
    this.universes = data.universes ? data.universes : [];
    this.short_question = data.short_question;
    this.image_url = data.image_url;
  }

  public getReponseByCode?(code: string): {
    label: string;
    code: string;
    ngc_code?: string;
  } {
    if (!this.reponses) {
      return null;
    }
    const found = this.reponses.find((r) => r.code === code);
    return found
      ? {
          label: found.label,
          code: found.code,
          ngc_code: found.ngc_code,
        }
      : null;
  }
}
