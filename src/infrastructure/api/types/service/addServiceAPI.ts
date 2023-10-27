import { ApiProperty } from '@nestjs/swagger';

export class AddServiceAPI {
  @ApiProperty() service_definition_id: string;
}
