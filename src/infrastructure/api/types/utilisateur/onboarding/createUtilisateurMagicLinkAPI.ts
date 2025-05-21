import { ApiProperty } from '@nestjs/swagger';
import { SourceInscription } from '../../../../../domain/utilisateur/utilisateur';

export class CreateUtilisateurMagicLinkAPI {
  @ApiProperty({ required: true })
  email: string;

  @ApiProperty({ required: false, enum: SourceInscription })
  source_inscription: SourceInscription;

  @ApiProperty({ required: false })
  situation_ngc_id?: string;

  @ApiProperty({
    required: false,
    description: `Paramètre optionnel qui sera ajouté à l'URL de connexion magiclink, que des charactères [a-zA-Z] autorisés`,
  })
  origin: string;
}
