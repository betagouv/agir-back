import { ApiProperty } from '@nestjs/swagger';
import { Thematique } from '../../../../domain/thematique';
import { CMSEvent } from './CMSEvent';
import { CMSModel } from './CMSModels';

export class CMSWebhookAPI {
  @ApiProperty() id: string;
  @ApiProperty({ enum: CMSModel }) model: CMSModel;
  @ApiProperty({ enum: CMSEvent }) event: CMSEvent;

  @ApiProperty() titre: string;
  @ApiProperty() sousTitre: string;
  @ApiProperty({ enum: Thematique }) thematique: Thematique;
  @ApiProperty() rubriques: string[];
  @ApiProperty() duree: string;
  @ApiProperty() frequence: string;
  @ApiProperty() imageUrl: string;
  @ApiProperty() difficulty: number;
  @ApiProperty() points?: number;
  @ApiProperty() codesPostaux?: string[];
}
