import { ApiProperty } from '@nestjs/swagger';

export class ServiceAPI {
  @ApiProperty() titre: string;
  @ApiProperty() url: string;
}
