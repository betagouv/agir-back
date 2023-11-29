import { ApiProperty } from '@nestjs/swagger';
import { Utilisateur } from '../../../../../src/domain/utilisateur/utilisateur';
import { UtilisateurAPI } from './utilisateurAPI';

export class LoggedUtilisateurAPI {
  @ApiProperty({ type: String })
  token: string;

  @ApiProperty({ type: UtilisateurAPI })
  utilisateur: UtilisateurAPI;

  public static mapToAPI(
    token: string,
    user: Utilisateur,
  ): LoggedUtilisateurAPI {
    return {
      utilisateur: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        code_postal: user.code_postal,
        commune: user.commune,
        revenu_fiscal: user.revenu_fiscal,
        nombre_de_parts_fiscales: user.parts,
        email: user.email,
        quizzProfile: user.quizzProfile.getData(),
        created_at: user.created_at,
      },
      token: token,
    };
  }
}
