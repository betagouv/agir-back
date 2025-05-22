import { ContenuLocal } from '../contenu/contenuLocal';
import { Thematique } from '../thematique/thematique';
import { Besoin } from './besoin';
import { Echelle } from './echelle';

export class AideDefinition implements ContenuLocal {
  constructor(data: AideDefinition) {
    Object.assign(this, data);
  }
  content_id: string;
  titre: string;
  contenu: string;
  partenaires_supp_ids: string[];
  url_simulateur: string;
  url_source: string;
  url_demande: string;
  is_simulateur: boolean;
  codes_postaux: string[];
  thematiques: Thematique[];
  montant_max: number;
  echelle: Echelle;
  besoin: Besoin;
  besoin_desc: string;
  include_codes_commune: string[];
  exclude_codes_commune: string[];
  codes_departement: string[];
  codes_region: string[];
  date_expiration: Date;
  derniere_maj: Date;
  est_gratuit: boolean;
  codes_commune_from_partenaire: string[];
  codes_departement_from_partenaire: string[];
  codes_region_from_partenaire: string[];
  VISIBLE_PROD: boolean;
}
