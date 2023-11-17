import { ApiProperty } from '@nestjs/swagger';

export class GroupeAPI {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() description?: string;
}
