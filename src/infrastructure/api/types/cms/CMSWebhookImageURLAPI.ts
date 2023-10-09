import { ApiProperty } from '@nestjs/swagger';

export class CMSWebhookImageURLAPI {
  @ApiProperty() formats: { thumbnail: { url: string } };
}
