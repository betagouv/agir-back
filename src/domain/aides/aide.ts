import { ContenuLocal } from '../contenu/contenuLocal';
import { AideDefinition } from './aideDefinition';

export class Aide extends AideDefinition implements ContenuLocal {
  constructor(data: AideDefinition) {
    super(data);
  }
  ca?: string[];
  cu?: string[];
  cc?: string[];
  metropoles?: string[];
  vue_at?: Date;
  clicked_demande?: boolean;
  clicked_infos?: boolean;
}
