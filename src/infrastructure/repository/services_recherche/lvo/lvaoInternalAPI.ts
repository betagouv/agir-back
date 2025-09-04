import { ActeurLVAO } from '../../../../domain/lvao/acteur_LVAO';
import { ActionLVAO } from '../../../../domain/lvao/action_LVAO';
import { LabelLVAO } from '../../../../domain/lvao/label_LVAO';
import { ObjetLVAO } from '../../../../domain/lvao/objet_LVAO';
import { PublicLVAO } from '../../../../domain/lvao/public_LVAO';
import { SourceLVAO } from '../../../../domain/lvao/source_LVAO';
import { TypeActeurLVAO } from '../../../../domain/lvao/typeActeur_LVAO';
import { TypeServiceLVAO } from '../../../../domain/lvao/typeService_LVAO';

export class ActionLVAO_API {
  action: ActionLVAO;
  sous_categories: ObjetLVAO[];
}

export class ActeurLVAO_API {
  id: string;
  sources: SourceLVAO[];
  nom: string;
  nom_commercial: string;
  distance_metres?: number;
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
  detail_services: ActionLVAO_API[];
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

  public static mapToDomain(acteur: ActeurLVAO_API): ActeurLVAO {
    const result = new ActeurLVAO({
      acheter: acteur.acheter.map((e) => ObjetLVAO[e]),
      adresse: acteur.adresse,
      code_postal: acteur.code_postal,
      complement_adresse: acteur.complement_adresse,
      date_derniere_maj: new Date(acteur.date_derniere_maj),
      description: acteur.description,
      detail_services: acteur.detail_services,
      donner: acteur.donner.map((e) => ObjetLVAO[e]),
      echanger: acteur.echanger.map((e) => ObjetLVAO[e]),
      emprunter: acteur.emprunter.map((e) => ObjetLVAO[e]),
      id: acteur.id,
      labels: acteur.labels.map((e) => LabelLVAO[e]),
      latitude: acteur.latitude,
      longitude: acteur.longitude,
      louer: acteur.louer.map((e) => ObjetLVAO[e]),
      mettreenlocation: acteur.mettreenlocation.map((e) => ObjetLVAO[e]),
      nom: acteur.nom,
      nom_commercial: acteur.nom_commercial,
      preter: acteur.preter.map((e) => ObjetLVAO[e]),
      reparer: acteur.reparer.map((e) => ObjetLVAO[e]),
      reprise: acteur.reprise,
      reprise_exclusif: acteur.reprise_exclusif,
      revendre: acteur.revendre.map((e) => ObjetLVAO[e]),
      siren: acteur.siren,
      siret: acteur.siret,
      sources: acteur.sources.map((e) => SourceLVAO[e]),
      sur_rdv: acteur.sur_rdv,
      telephone: acteur.telephone,
      trier: acteur.trier.map((e) => ObjetLVAO[e]),
      type_acteur: TypeActeurLVAO[acteur.type_acteur],
      type_public: PublicLVAO[acteur.type_public],
      types_service: acteur.types_service.map((e) => TypeServiceLVAO[e]),
      url: acteur.url,
      ville: acteur.ville,
    });

    return result;
  }
}
