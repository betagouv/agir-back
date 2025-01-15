import { Thematique } from '../contenu/thematique';
import { Besoin } from './besoin';

export class AideDefinition {
  constructor(data: AideDefinition) {
    Object.assign(this, data);
  }
  content_id: string;
  titre: string;
  contenu: string;
  partenaire_id: string;
  url_simulateur: string;
  url_source: string;
  url_demande: string;
  is_simulateur: boolean;
  codes_postaux: string[];
  thematiques: Thematique[];
  montant_max: number;
  echelle: string;
  besoin: Besoin;
  besoin_desc: string;
  include_codes_commune: string[];
  exclude_codes_commune: string[];
  codes_departement: string[];
  codes_region: string[];
  ca?: string[];
  cu?: string[];
  cc?: string[];
  metropoles?: string[];
  clicked_demande?: boolean;
  clicked_infos?: boolean;
  date_expiration: Date;
}
