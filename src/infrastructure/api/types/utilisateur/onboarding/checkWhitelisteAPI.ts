import { ApiProperty } from '@nestjs/swagger';
import { Profil } from '../../../../../../src/domain/utilisateur/utilisateurAttente';

export class CheckWhitelisteAPI {
  @ApiProperty() email: string;
}
export class ReponseCheckWhitelisteAPI {
  @ApiProperty() is_whitelisted: boolean;
}
export class UtilisateurAttenteAPI {
  @ApiProperty() email: string;
  @ApiProperty() code_postal: string;
  @ApiProperty({ enum: Profil }) code_profil: Profil;
}
