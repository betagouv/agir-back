import { ApiProperty } from '@nestjs/swagger';

export class ModifierMdpAPI {
  @ApiProperty()
  email: string;
  @ApiProperty()
  mot_de_passe: string;
  @ApiProperty()
  code: string;
}
