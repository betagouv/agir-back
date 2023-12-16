import { ApiProperty } from '@nestjs/swagger';
import { Feature } from '../../../../../src/domain/gamification/feature';
import { Utilisateur } from '../../../../../src/domain/utilisateur/utilisateur';
import { QuizzProfileAPI } from '../quizz/quizzProfileAPI';

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
  quizzProfile: QuizzProfileAPI;

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
      code_postal: user.code_postal,
      commune: user.commune,
      revenu_fiscal: user.revenu_fiscal,
      nombre_de_parts_fiscales: user.getNombrePartsFiscalesOuEstimee(),
      quizzProfile: user.quizzProfile.getData(),
      created_at: user.created_at,
      fonctionnalites_debloquees: user.unlocked_features.getUnlockedList(),
    };
  }
}
