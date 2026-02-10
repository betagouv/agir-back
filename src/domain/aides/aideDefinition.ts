import { ContenuLocal } from '../contenu/contenuLocal';
import { Thematique } from '../thematique/thematique';
import { Besoin } from './besoin';
import { Echelle } from './echelle';

export class AideDefinition implements ContenuLocal {
  besoin: Besoin;
  besoin_desc: string;
  codes_commune_from_partenaire: string[];
  codes_departement_from_partenaire: string[];
  codes_departement: string[];
  codes_postaux: string[];
  codes_region_from_partenaire: string[];
  codes_region: string[];
  content_id: string;
  contenu: string;
  date_expiration: Date;
  derniere_maj: Date;
  echelle: Echelle;
  est_gratuit: boolean;
  exclude_codes_commune: string[];
  include_codes_commune: string[];
  is_simulateur: boolean;
  montant_max: number;
  partenaires_supp_ids: string[];
  thematiques: Thematique[];
  titre: string;
  url_demande: string;
  url_simulateur: string;
  url_source: string;
  VISIBLE_PROD: boolean;
  question_accroche: string;
  introduction: string;
  explication: string;
  conditions_eligibilite: string;
  equipements_eligibles: string;
  travaux_eligibles: string;
  montant: string;
  en_savoir_plus: string;
  description_courte: string;

  constructor(data: AideDefinition) {
    Object.assign(this, data);
  }
}
