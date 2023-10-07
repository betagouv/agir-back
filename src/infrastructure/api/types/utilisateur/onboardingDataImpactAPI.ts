import { ApiProperty } from '@nestjs/swagger';
export class OnboardingDataImpactAPI {
  @ApiProperty({ type: 'integer' })
  transports: number;
  @ApiProperty({ type: 'integer' })
  consommation: number;
  @ApiProperty({ type: 'integer' })
  logement: number;
  @ApiProperty({ type: 'integer' })
  alimentation: number;

  @ApiProperty({ required: false })
  phrase_1?: string;
  @ApiProperty({ required: false })
  phrase_2?: string;
  @ApiProperty({ required: false })
  phrase_3?: string;
}
