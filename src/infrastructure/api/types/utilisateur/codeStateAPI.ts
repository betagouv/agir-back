import { ApiProperty } from '@nestjs/swagger';

export class CodeStateAPI {
  @ApiProperty({
    description: `code OIDC pour finalisation connexion/inscription`,
  })
  oidc_code: string;

  @ApiProperty({
    description: `token technique pour protéger le flux de connexion`,
  })
  oidc_state: string;
}
