import { ApiProperty } from '@nestjs/swagger';
import { Utilisateur } from '../../../../../src/domain/utilisateur/utilisateur';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../../domain/logement/logement';

export class LogementAPI {
  @ApiProperty({ required: false }) nombre_adultes: number;
  @ApiProperty({ required: false }) nombre_enfants: number;
  @ApiProperty({ required: false }) code_postal: string;
  @ApiProperty({ required: false }) commune: string;
  @ApiProperty({ required: false }) code_commune: string;
  @ApiProperty() latitude: number;
  @ApiProperty() longitude: number;
  @ApiProperty() numero_rue: string;
  @ApiProperty() rue: string;
  @ApiProperty() est_prm_present: boolean;
  @ApiProperty() est_prm_obsolete: boolean;
  @ApiProperty() est_adresse_complete: boolean;

  @ApiProperty({ required: false }) commune_label: string;
  @ApiProperty({ enum: TypeLogement }) type: TypeLogement;
  @ApiProperty({ enum: Superficie }) superficie: Superficie;
  @ApiProperty({ required: false }) proprietaire: boolean;
  @ApiProperty({ enum: Chauffage }) chauffage: Chauffage;
  @ApiProperty({ required: false }) plus_de_15_ans: boolean;
  @ApiProperty({ enum: DPE }) dpe: DPE;

  public static mapToAPI(user: Utilisateur): LogementAPI {
    const log = user.logement;
    return {
      nombre_adultes: log.nombre_adultes,
      nombre_enfants: log.nombre_enfants,
      code_postal: log.code_postal,
      commune: log.commune,
      rue: log.rue,
      numero_rue: log.numero_rue,
      longitude: log.longitude,
      latitude: log.latitude,
      type: log.type,
      superficie: log.superficie,
      proprietaire: log.proprietaire,
      chauffage: log.chauffage,
      plus_de_15_ans: log.plus_de_15_ans,
      dpe: log.dpe,
      commune_label: log.commune_label,
      code_commune: log.code_commune,
      est_prm_present: !!log.prm,
      est_prm_obsolete: log.est_prm_obsolete,
      est_adresse_complete: log.possedeAdressePrecise(),
    };
  }
}

export class UtilisateurUpdateProfileAPI {
  @ApiProperty({ required: false })
  pseudo: string;
  @ApiProperty({ required: false })
  nom: string;
  @ApiProperty({ required: false })
  prenom: string;
  @ApiProperty({ required: false })
  annee_naissance: number;
  @ApiProperty({ required: false })
  mois_naissance: number;
  @ApiProperty({ required: false })
  jour_naissance: number;
  @ApiProperty({ required: false })
  revenu_fiscal?: number;
  @ApiProperty({ required: false })
  mot_de_passe?: string;
  @ApiProperty({ required: false })
  nombre_de_parts_fiscales: number;
  @ApiProperty({ required: false })
  abonnement_ter_loire: boolean;
}

export class UtilisateurProfileAPI {
  @ApiProperty({ required: true })
  nom: string;

  @ApiProperty({ required: true })
  prenom: string;

  @ApiProperty({ required: true })
  pseudo: string;

  @ApiProperty({ required: false })
  annee_naissance: number;

  @ApiProperty({ required: false })
  mois_naissance: number;

  @ApiProperty({ required: false })
  jour_naissance: number;

  @ApiProperty({ required: true })
  email: string;

  @ApiProperty({ required: false })
  code_postal?: string;

  @ApiProperty({ required: false })
  commune?: string;

  @ApiProperty({ required: false })
  revenu_fiscal?: number;

  @ApiProperty({ required: true })
  mot_de_passe?: string;

  @ApiProperty({ required: false })
  nombre_de_parts_fiscales: number;

  @ApiProperty({ required: false })
  abonnement_ter_loire: boolean;

  @ApiProperty()
  is_nom_prenom_modifiable: boolean;

  @ApiProperty({ type: LogementAPI })
  logement: LogementAPI;

  @ApiProperty()
  popup_reset_est_vue: boolean;

  public static mapToAPI(user: Utilisateur): UtilisateurProfileAPI {
    return {
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      code_postal: user.logement.code_postal,
      commune: user.logement.commune,
      revenu_fiscal: user.revenu_fiscal,
      nombre_de_parts_fiscales: user.getNombrePartsFiscalesOuEstimee(),
      abonnement_ter_loire: user.abonnement_ter_loire,
      logement: LogementAPI.mapToAPI(user),
      annee_naissance: user.annee_naissance,
      mois_naissance: user.mois_naissance,
      jour_naissance: user.jour_naissance,
      is_nom_prenom_modifiable: user.isDataFranceConnectModifiable(),
      pseudo: user.pseudo,
      popup_reset_est_vue: user.gamification.isPopupResetVue(),
    };
  }
}
