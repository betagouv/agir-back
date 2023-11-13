import { ApiProperty } from '@nestjs/swagger';
import { UtilisateurAPI } from '../utilisateur/utilisateurAPI';

export class GroupeAPI {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() description?: string;
}
