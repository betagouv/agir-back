import { Thematique } from '../contenu/thematique';
import { Besoin } from './besoin';

export class Aide {
  constructor(data: Aide) {
    Object.assign(this, data);
  }
  content_id: string;
  titre: string;
  contenu: string;
  url_simulateur: string;
  is_simulateur: boolean;
  codes_postaux: string[];
  thematiques: Thematique[];
  montant_max: number;
  besoin: Besoin;
  besoin_desc: string;
  include_codes_commune: string;
  exclude_codes_commune: string;
  codes_departement: string;
  codes_region: string;
}
