import { Categorie } from '../contenu/categorie';
import { Tag } from '../scoring/tag';
import { Thematique } from '../thematique/thematique';
import { ConditionKYC } from './conditionKYC';
import { TypeReponseQuestionKYC, Unite } from './QuestionKYCData';

export type ReponseDefinition = {
  label: string;
  code: string;
  ngc_code?: string;
};

export class KycDefinition {
  id_cms: number;
  code: string;
  type: TypeReponseQuestionKYC;
  categorie: Categorie;
  points: number;
  is_ngc: boolean;
  a_supprimer: boolean;
  ngc_key: string;
  question: string;
  short_question: string;
  reponses?: ReponseDefinition[];
  thematique: Thematique;
  tags: Tag[];
  image_url: string;
  conditions: ConditionKYC[][];
  unite: Unite;
  emoji: string;

  constructor(data: KycDefinition) {
    Object.assign(this, data);
    this.reponses = data.reponses ? data.reponses : [];
    this.tags = data.tags ? data.tags : [];
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
  public getReponseByCode_v2?(code: string): ReponseDefinition {
    if (!this.reponses) {
      return null;
    }
    return this.reponses.find((r) => r.code === code);
  }
}
