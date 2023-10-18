import { ApiProperty } from '@nestjs/swagger';

export class RenvoyerCodeAPI {
  @ApiProperty({ type: String })
  email: string;
}
