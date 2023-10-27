import { ApiProperty } from '@nestjs/swagger';

export class ServiceDefinitionAPI {
  @ApiProperty() id: string;
  @ApiProperty() titre: string;
  @ApiProperty() url?: string;
  @ApiProperty() local: boolean;
  @ApiProperty() is_url_externe?: boolean;
}
