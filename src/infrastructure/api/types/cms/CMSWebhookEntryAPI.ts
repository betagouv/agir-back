import { ApiProperty } from '@nestjs/swagger';
import { Thematique } from '../../../../domain/thematique';
import { CMSWebhookImageURLAPI } from './CMSWebhookImageURLAPI';

export class CMSWebhookEntryAPI {
  @ApiProperty() id: number;
  @ApiProperty() titre: string;
  @ApiProperty() sousTitre: string;
  @ApiProperty({ enum: Thematique }) thematique: Thematique;
  @ApiProperty() rubriques: string[];
  @ApiProperty() duree: string;
  @ApiProperty() frequence: string;
  @ApiProperty({ type: CMSWebhookImageURLAPI }) imageUrl: CMSWebhookImageURLAPI;
  @ApiProperty() difficulty: number;
  @ApiProperty() points?: number;
  @ApiProperty() codePostal?: string;
}
