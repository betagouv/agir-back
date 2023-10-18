import { ApiProperty } from '@nestjs/swagger';

export class ProspectSubmitAPI {
  @ApiProperty({ type: String })
  email: string;
}
