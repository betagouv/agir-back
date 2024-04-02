import { ApiProperty } from '@nestjs/swagger';

export class CMSTagAPI {
  @ApiProperty() id: number;
  @ApiProperty() code: string;
}
