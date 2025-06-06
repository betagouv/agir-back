import { ApiProperty } from '@nestjs/swagger';
import { Utilisateur } from '../../../../../src/domain/utilisateur/utilisateur';

export class UtilisateurAPI {
  @ApiProperty()
  id: string;

  @ApiProperty()
  pseudo: string;

  @ApiProperty()
  nom: string;

  @ApiProperty()
  prenom: string;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  is_onboarding_done: boolean;

  @ApiProperty()
  is_nom_prenom_modifiable: boolean;

  @ApiProperty()
  couverture_aides_ok: boolean;

  @ApiProperty()
  popup_reset_est_vue: boolean;

  public static mapToAPI(user: Utilisateur): UtilisateurAPI {
    return {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      is_onboarding_done: user.isOnboardingDone(),
      couverture_aides_ok: user.couverture_aides_ok,
      is_nom_prenom_modifiable: user.isDataFranceConnectModifiable(),
      pseudo: user.pseudo,
      popup_reset_est_vue: user.gamification.isPopupResetVue(),
    };
  }
}
