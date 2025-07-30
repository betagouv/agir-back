import { ApiProperty } from '@nestjs/swagger';
import { Utilisateur } from '../../../../../src/domain/utilisateur/utilisateur';
import { LogementAPI } from './logementAPI';

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
export { LogementAPI };
