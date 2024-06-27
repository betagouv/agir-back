import { ApiProperty } from '@nestjs/swagger';

export class RechercheServiceInputAPI {
  @ApiProperty({ required: false }) categorie: string;
  @ApiProperty({ required: false }) nombre_resultats: number;
  @ApiProperty({ required: false }) rayon: number;
}
