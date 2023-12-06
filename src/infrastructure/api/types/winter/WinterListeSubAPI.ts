import { ApiProperty } from '@nestjs/swagger';

export class PartnerSubscriptionAPI {
  @ApiProperty() enedis_prm: string;
  @ApiProperty() department_number: string;
  @ApiProperty() pk: string;
}
export class WinterListeSubAPI {
  @ApiProperty() count: number;
  @ApiProperty() next: string;
  @ApiProperty() previous: string;

  @ApiProperty({ type: [PartnerSubscriptionAPI] })
  results: PartnerSubscriptionAPI[];
}
