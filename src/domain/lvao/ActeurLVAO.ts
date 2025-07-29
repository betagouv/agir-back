export class ActionLVAO {
  action: string;
  sous_categfories: string[];
}

export class ActeurLVAO {
  id: string;
  sources: string[];
  nom: string;
  nom_commercial: string;
  siren: string;
  siret: string;
  description: string;
  type_acteur: string;
  url: string;
  telephone: string;
  adresse: string;
  complement_adresse: string;
  code_postal: string;
  ville: string;
  latitude: number;
  longitude: number;
  labels: string[];
  type_public: string;
  reprise: string;
  reprise_exclusif: boolean;
  sur_rdv: boolean;
  types_service: string[];
  detail_services: ActionLVAO[];
  date_derniere_maj: Date;
  emprunter: string[];
  preter: string[];
  louer: string[];
  mettreenlocation: string[];
  reparer: string[];
  donner: string[];
  trier: string[];
  echanger: string[];
  revendre: string[];
  acheter: string[];

  constructor(acteur: ActeurLVAO) {
    Object.assign(this, acteur);
  }
}
