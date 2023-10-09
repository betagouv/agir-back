import { ApiProperty } from '@nestjs/swagger';

export class UtilisateurProfileAPI {
  @ApiProperty({ required: false })
  nom: string;
  @ApiProperty({ required: false })
  prenom: string;
  @ApiProperty({ required: false })
  email?: string;
  @ApiProperty({ required: false })
  code_postal?: string;
}
