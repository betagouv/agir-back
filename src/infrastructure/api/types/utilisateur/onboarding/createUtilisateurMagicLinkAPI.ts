import { ApiProperty } from '@nestjs/swagger';
import { SourceInscription } from '../../../../../domain/utilisateur/utilisateur';

export class CreateUtilisateurMagicLinkAPI {
  @ApiProperty({ required: true })
  email: string;

  @ApiProperty({ required: false, enum: SourceInscription })
  source_inscription: SourceInscription;

  @ApiProperty({
    required: false,
    description: `un acteur proposant l'inscription, par exemple un partenaire`,
    maxLength: 20,
  })
  referer: string;

  @ApiProperty({
    required: false,
    description: `un texte arbitraire qui peut être fourni à l'inscription en complément de 'referer', pour tagguer par exemple un sous groupe d'utilisateurs`,
    maxLength: 50,
  })
  referer_keyword: string;

  @ApiProperty({ required: false })
  situation_ngc_id?: string;

  @ApiProperty({
    required: false,
    description: `Paramètre optionnel qui sera ajouté à l'URL de connexion magiclink, que des charactères [a-zA-Z] autorisés`,
  })
  origin: string;
}
