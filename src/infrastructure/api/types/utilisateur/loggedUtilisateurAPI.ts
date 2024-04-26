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
      token: token,
      utilisateur: UtilisateurAPI.mapToAPI(user),
    };
  }
}
