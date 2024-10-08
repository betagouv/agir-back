import { ApiProperty } from '@nestjs/swagger';
import { SourceInscription } from '../../../../../domain/utilisateur/utilisateur';

export class CreateUtilisateurAPI {
  @ApiProperty({ required: true })
  email: string;

  @ApiProperty({ required: false, enum: SourceInscription })
  source_inscription: SourceInscription;

  @ApiProperty({ required: true })
  mot_de_passe: string;

  @ApiProperty({ required: false })
  situation_ngc_id?: string;
}
