import { ApiProperty } from '@nestjs/swagger';

export class ReponseAPI {
  @ApiProperty({ type: [String] })
  reponse: string[];
}
