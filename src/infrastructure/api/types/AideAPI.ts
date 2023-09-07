import { ApiProperty } from '@nestjs/swagger';

export class CollectiviteAPI {
  @ApiProperty() kind: string;
  @ApiProperty() value: string;
  @ApiProperty() code?: string;
}

export class AideAPI {
  @ApiProperty() libelle: string;
  @ApiProperty() montant: string | null;
  @ApiProperty() plafond: string | null;
  @ApiProperty() lien: string;
  @ApiProperty({ type: CollectiviteAPI }) collectivite?: CollectiviteAPI;
  @ApiProperty() description?: string;
  @ApiProperty() logo?: string;
}
