import { ApiProperty } from '@nestjs/swagger';

export class CMSThematiqueAPI {
  @ApiProperty() id: number;
  @ApiProperty() titre: string;
}
