import { ApiProperty } from '@nestjs/swagger';

export class CodeStateAPI {
  @ApiProperty({
    description: `Code OIDC pour finalisation connexion/inscription`,
  })
  oidc_code: string;

  @ApiProperty({
    description: `Token technique pour protéger le flux de connexion`,
  })
  oidc_state: string;
}
