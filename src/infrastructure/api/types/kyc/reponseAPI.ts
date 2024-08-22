import { ApiProperty } from '@nestjs/swagger';

class ReponseKYCMosaicRetourAPI {
  @ApiProperty()
  code: string;

  @ApiProperty()
  value_boolean: boolean;

  @ApiProperty()
  value_number: number;
}

export class ReponseAPI {
  @ApiProperty({ type: [String] })
  reponse: string[];
  @ApiProperty({ type: [ReponseKYCMosaicRetourAPI] })
  reponse_mosaic: ReponseKYCMosaicRetourAPI[];
}
