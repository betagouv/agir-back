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
  code_postal: string;

  @ApiProperty()
  commune: string;

  @ApiProperty()
  revenu_fiscal: number;

  @ApiProperty()
  nombre_de_parts_fiscales: number;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty({ enum: Feature, enumName: 'Feature', isArray: true })
  fonctionnalites_debloquees: Feature[];

  public static mapToAPI(user: Utilisateur): UtilisateurAPI {
    return {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      // FIXME : supprimer infos pas nécessaires
      code_postal: user.logement.code_postal,
      commune: user.logement.commune,
      revenu_fiscal: user.revenu_fiscal,
      nombre_de_parts_fiscales: user.getNombrePartsFiscalesOuEstimee(),
      created_at: user.created_at,
      fonctionnalites_debloquees: user.unlocked_features.getUnlockedFeatures(),
    };
  }
}
