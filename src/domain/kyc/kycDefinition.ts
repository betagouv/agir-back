import { Categorie } from '../contenu/categorie';
import { Thematique } from '../contenu/thematique';
import { Tag } from '../scoring/tag';
import { ConditionKYC } from './conditionKYC';
import { TypeReponseQuestionKYC, Unite } from './questionKYC';

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
  reponses?: {
    label: string;
    code: string;
    ngc_code?: string;
    value?: string;
  }[];
  thematique: Thematique;
  tags: Tag[];
  universes: string[];
  image_url: string;
  conditions: ConditionKYC[][];
  unite: Unite;

  constructor(data: KycDefinition) {
    Object.assign(this, data);
    this.reponses = data.reponses ? data.reponses : [];
    this.tags = data.tags ? data.tags : [];
    this.universes = data.universes ? data.universes : [];
    this.conditions = data.conditions ? data.conditions : [];
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
