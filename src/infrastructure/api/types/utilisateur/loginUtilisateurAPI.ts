import { ApiProperty } from '@nestjs/swagger';

export class LoginUtilisateurAPI {
  @ApiProperty()
  email: string;
  @ApiProperty()
  mot_de_passe: string;
}
