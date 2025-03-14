import { ApiProperty } from '@nestjs/swagger';

export class CodeStateInputAPI {
  @ApiProperty({
    type: String,
    description: `Code OIDC pour finalisation connexion/inscription`,
  })
  oidc_code: string;

  @ApiProperty({
    type: String,
    description: `Token technique pour protéger le flux de connexion`,
  })
  oidc_state: string;
}
