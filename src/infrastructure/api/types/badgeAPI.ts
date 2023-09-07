import { ApiProperty } from '@nestjs/swagger';

export class BadgeAPI {
  @ApiProperty() titre: string;
  @ApiProperty() type: string;
}
