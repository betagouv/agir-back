import { ApiProperty } from '@nestjs/swagger';
import { UtilisateurAPI } from './utilisateurAPI';

export class LoggedUtilisateurAPI {
  @ApiProperty({ type: String })
  token: string;

  @ApiProperty({ type: UtilisateurAPI })
  utilisateur: UtilisateurAPI;
}
