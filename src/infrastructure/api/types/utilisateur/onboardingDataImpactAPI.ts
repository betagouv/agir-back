import { ApiProperty } from '@nestjs/swagger';

export class Phrase {
  @ApiProperty({ type: 'integer' })
  pourcent: number;
  @ApiProperty({ type: 'string' })
  phrase: string;
}
export class OnboardingDataImpactAPI {
  @ApiProperty({ type: 'integer' })
  transports: number;
  @ApiProperty({ type: 'integer' })
  consommation: number;
  @ApiProperty({ type: 'integer' })
  logement: number;
  @ApiProperty({ type: 'integer' })
  alimentation: number;

  @ApiProperty({ required: false, type: String })
  phrase?: string;
  @ApiProperty({ required: false, type: String })
  phrase_1?: string;
  @ApiProperty({ required: false, type: String })
  phrase_2?: string;
  @ApiProperty({ required: false, type: String })
  phrase_3?: string;
  @ApiProperty({ required: false, type: String })
  phrase_4?: string;
}
