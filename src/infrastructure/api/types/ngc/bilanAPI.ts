import { ApiProperty } from '@nestjs/swagger';

export class DetailsAPI {
  @ApiProperty() divers: number;
  @ApiProperty() logement: number;
  @ApiProperty() transport: number;
  @ApiProperty() alimentation: number;
  @ApiProperty() services_societaux: number;
}
export class BilanAPI {
  @ApiProperty() id: string;
  @ApiProperty() created_at: Date;
  @ApiProperty() situation: object;
  @ApiProperty() bilan_carbone_annuel: number;
  @ApiProperty({ type: DetailsAPI }) details: DetailsAPI;
}
