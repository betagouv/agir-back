import { ApiProperty } from '@nestjs/swagger';

export class UtilisateurProfileAPI {
  @ApiProperty({ required: true })
  nom: string;
  @ApiProperty({ required: true })
  prenom: string;
  @ApiProperty({ required: true })
  email: string;
  @ApiProperty({ required: false })
  code_postal?: string;
  @ApiProperty({ required: false })
  commune?: string;
  @ApiProperty({ required: false })
  revenu_fiscal?: number;
  @ApiProperty({ required: true })
  mot_de_passe?: string;
}
