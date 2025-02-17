import { ApiProperty } from '@nestjs/swagger';

export class logoutAPI {
  @ApiProperty({ type: String, required: false })
  france_connect_logout_url: string;
}
