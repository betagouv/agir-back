import { ApiProperty } from '@nestjs/swagger';

export class BilanTotalAPI {
  @ApiProperty() impact_kg_annee: number;
}
