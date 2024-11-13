import { ApiProperty } from '@nestjs/swagger';

export class ReponseKYCAPI_v2 {
  @ApiProperty({ required: true }) value: string;
  @ApiProperty({ required: true }) code: string;
}
