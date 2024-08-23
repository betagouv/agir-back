import { ApiProperty } from '@nestjs/swagger';
import { SourceInscription } from '../../../../../domain/utilisateur/utilisateur';

export class CreateUtilisateurAPI_v2 {
  @ApiProperty()
  email: string;

  @ApiProperty({ required: false, enum: SourceInscription })
  source_inscription: SourceInscription;

  @ApiProperty({ required: false })
  mot_de_passe?: string;
}
