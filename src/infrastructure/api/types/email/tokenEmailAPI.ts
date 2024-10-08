import { ApiProperty } from '@nestjs/swagger';

export class DisableEmailAPI {
  @ApiProperty() token: string;
}
