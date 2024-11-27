import { ApiProperty } from '@nestjs/swagger';

export class ReponseKYCAPI_v2 {
  @ApiProperty({ required: false }) selected: boolean;
  @ApiProperty({ required: false }) value: string;
  @ApiProperty({ required: false }) code: string;
}
