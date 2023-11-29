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

export class prixVeloDTO {
  @ApiProperty({ default: 10000, required: false })
  prixVelo: number;
}
export class nbPartsDTO {
  @ApiProperty({ default: 1, required: false })
  nbParts: number;
}

export class revenuFiscalDeReferenceDTO {
  @ApiProperty({ default: 1, required: false })
  revenuFiscalDeReference: number;
}
