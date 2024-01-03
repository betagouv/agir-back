import { ApiProperty } from '@nestjs/swagger';
import { CMSThematiqueAPI } from './CMSThematiqueAPI';
import { CMSWebhookImageURLAPI } from './CMSWebhookImageURLAPI';

export class CMSWebhookRubriqueAPI {
  @ApiProperty() id: number;
  @ApiProperty() titre: string;
}
export class CMSWebhookEntryAPI {
  @ApiProperty() id: number;
  @ApiProperty() titre: string;
  @ApiProperty() sousTitre: string;
  @ApiProperty({ type: CMSThematiqueAPI })
  thematique_gamification: CMSThematiqueAPI;
  @ApiProperty({ type: [CMSThematiqueAPI] })
  thematiques: CMSThematiqueAPI[];
  @ApiProperty({ type: [CMSWebhookRubriqueAPI] })
  rubriques: CMSWebhookRubriqueAPI[];
  @ApiProperty() duree: string;
  @ApiProperty() frequence: string;
  @ApiProperty({ type: CMSWebhookImageURLAPI }) imageUrl: CMSWebhookImageURLAPI;
  @ApiProperty() difficulty: number;
  @ApiProperty() points?: number;
  @ApiProperty() codes_postaux?: string;
  @ApiProperty() publishedAt: Date;
}
