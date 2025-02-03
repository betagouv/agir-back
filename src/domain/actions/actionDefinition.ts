import { Thematique } from '../contenu/thematique';

export class ActionDefinition {
  cms_id: string;
  code: string;
  titre: string;
  thematique: Thematique;

  constructor(data: ActionDefinition) {
    Object.assign(this, data);
  }
}
