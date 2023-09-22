import { ApiProperty } from '@nestjs/swagger';
import { CMSEvent } from './CMSEvent';
import { CMSModel } from './CMSModels';
import { CMSWebhookEntryAPI } from './CMSWebhookEntryAPI';

export class CMSWebhookAPI {
  @ApiProperty({ enum: CMSModel }) model: CMSModel;
  @ApiProperty({ enum: CMSEvent }) event: CMSEvent;

  @ApiProperty({ type: CMSWebhookEntryAPI }) entry: CMSWebhookEntryAPI;
}
