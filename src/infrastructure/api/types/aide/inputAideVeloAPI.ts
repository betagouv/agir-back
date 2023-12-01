import { ApiProperty } from '@nestjs/swagger';

export class InputAideVeloAPI {
  @ApiProperty() prix_du_velo: number;
}
