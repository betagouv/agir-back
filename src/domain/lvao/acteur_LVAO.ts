import { ActionLVAO } from './action_LVAO';
import { LabelLVAO } from './label_LVAO';
import { ObjetLVAO } from './objet_LVAO';
import { PublicLVAO } from './public_LVAO';
import { SourceLVAO } from './source_LVAO';
import { TypeActeurLVAO } from './typeActeur_LVAO';
import { TypeServiceLVAO } from './typeService_LVAO';

export class InnerActionLVAO {
  action: ActionLVAO;
  sous_categories: ObjetLVAO[];
}

export class ActeurLVAO {
  id: string;
  sources: SourceLVAO[];
  nom: string;
  nom_commercial: string;
  siren: string;
  siret: string;
  description: string;
  type_acteur: TypeActeurLVAO;
  url: string;
  telephone: string;
  adresse: string;
  complement_adresse: string;
  code_postal: string;
  ville: string;
  latitude: number;
  longitude: number;
  labels: LabelLVAO[];
  type_public: PublicLVAO;
  reprise: string;
  reprise_exclusif: boolean;
  sur_rdv: boolean;
  types_service: TypeServiceLVAO[];
  detail_services: InnerActionLVAO[];
  date_derniere_maj: Date;
  emprunter: ObjetLVAO[];
  preter: ObjetLVAO[];
  louer: ObjetLVAO[];
  mettreenlocation: ObjetLVAO[];
  reparer: ObjetLVAO[];
  donner: ObjetLVAO[];
  trier: ObjetLVAO[];
  echanger: ObjetLVAO[];
  revendre: ObjetLVAO[];
  acheter: ObjetLVAO[];
  distance_metres?: number;

  constructor(acteur: ActeurLVAO) {
    Object.assign(this, acteur);
  }
}
