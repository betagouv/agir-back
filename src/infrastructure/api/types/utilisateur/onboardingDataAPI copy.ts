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
}
