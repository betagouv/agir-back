import { ApiProperty } from '@nestjs/swagger';

export class ReponseKYCAPI {
  @ApiProperty({ type: [String] })
  reponse: string[];
}
