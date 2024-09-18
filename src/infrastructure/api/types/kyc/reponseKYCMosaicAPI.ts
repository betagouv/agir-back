import { ApiProperty } from '@nestjs/swagger';

export class ReponseUnitaireKYCMosaicAPI {
  @ApiProperty() code: string;
  @ApiProperty() boolean_value: boolean;
}

export class ReponseKYCMosaicAPI {
  @ApiProperty({ type: [ReponseUnitaireKYCMosaicAPI] })
  reponse_mosaic: ReponseUnitaireKYCMosaicAPI[];
}
