import { ApiProperty } from '@nestjs/swagger';

export class SituationNGCAPI {
  @ApiProperty() id: string;
  @ApiProperty() situation: object;
}
