import { ApiProperty } from '@nestjs/swagger';

export class ActionLVAO_API {
  @ApiProperty() action: string;
  @ApiProperty() sous_categfories: string[];
}

export class ActeurLVAO_API {
  @ApiProperty() id: string;
  @ApiProperty({ type: [String] }) sources: string[];
  @ApiProperty() nom: string;
  @ApiProperty() nom_commercial: string;
  @ApiProperty() siren: string;
  @ApiProperty() siret: string;
  @ApiProperty() description: string;
  @ApiProperty() type_acteur: string;
  @ApiProperty() url: string;
  @ApiProperty() telephone: string;
  @ApiProperty() adresse: string;
  @ApiProperty() complement_adresse: string;
  @ApiProperty() code_postal: string;
  @ApiProperty() ville: string;
  @ApiProperty() latitude: number;
  @ApiProperty() longitude: number;
  @ApiProperty({ type: [String] }) labels: string[];
  @ApiProperty() type_public: string;
  @ApiProperty() reprise: string;
  @ApiProperty() reprise_exclusif: boolean;
  @ApiProperty() sur_rdv: boolean;
  @ApiProperty({ type: [String] }) types_service: string[];
  @ApiProperty({ type: [ActionLVAO_API] }) detail_services: ActionLVAO_API[];
  @ApiProperty() date_derniere_maj: Date;
  @ApiProperty({ type: [String] }) emprunter: string[];
  @ApiProperty({ type: [String] }) preter: string[];
  @ApiProperty({ type: [String] }) louer: string[];
  @ApiProperty({ type: [String] }) mettreenlocation: string[];
  @ApiProperty({ type: [String] }) reparer: string[];
  @ApiProperty({ type: [String] }) donner: string[];
  @ApiProperty({ type: [String] }) trier: string[];
  @ApiProperty({ type: [String] }) echanger: string[];
  @ApiProperty({ type: [String] }) revendre: string[];
  @ApiProperty({ type: [String] }) acheter: string[];
}
