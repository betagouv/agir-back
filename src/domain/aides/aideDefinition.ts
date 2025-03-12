import { ContenuLocal } from '../contenu/contenuLocal';
import { Thematique } from '../thematique/thematique';
import { Echelle } from './echelle';

export class AideDefinition implements ContenuLocal {
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
  echelle: Echelle;
  besoin: string;
  besoin_desc: string;
  include_codes_commune: string[];
  exclude_codes_commune: string[];
  codes_departement: string[];
  codes_region: string[];
  date_expiration: Date;
  derniere_maj: Date;
  est_gratuit: boolean;
}
