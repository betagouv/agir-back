import { ApiProperty } from '@nestjs/swagger';
import { Feature } from '../../../../../src/domain/gamification/feature';
import { Utilisateur } from '../../../../../src/domain/utilisateur/utilisateur';

export class UtilisateurAPI {
  @ApiProperty()
  id: string;

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

  @ApiProperty({ enum: Feature, enumName: 'Feature', isArray: true })
  fonctionnalites_debloquees: Feature[];

  public static mapToAPI(user: Utilisateur): UtilisateurAPI {
    return {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      fonctionnalites_debloquees: user.unlocked_features.getUnlockedFeatures(),
      is_onboarding_done: user.isOnboardingDone(),
      couverture_aides_ok: user.couverture_aides_ok,
      is_nom_prenom_modifiable: user.isNomPrenomModifiable(),
    };
  }
}
