import { ApiProperty } from '@nestjs/swagger';
import { SourceInscription } from '../../../../../domain/utilisateur/utilisateur';

export class CreateUtilisateurAPI {
  @ApiProperty({ enum: SourceInscription })
  source_inscription: SourceInscription;
  @ApiProperty()
  nom?: string;
  @ApiProperty()
  prenom?: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  code_postal: string;
  @ApiProperty()
  commune: string;
  @ApiProperty()
  annee_naissance: number;
  @ApiProperty({ required: false })
  mot_de_passe: string;
}
