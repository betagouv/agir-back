import { ApiProperty } from '@nestjs/swagger';

export class ImpactAPI {
  @ApiProperty({ required: true }) grammes_co2: number;

  static toAPI(val: number): ImpactAPI {
    return {
      grammes_co2: val,
    };
  }
}
