import { ApiProperty } from '@nestjs/swagger';

export class CreateUtilisateurAPI_v2 {
  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  mot_de_passe?: string;
}
