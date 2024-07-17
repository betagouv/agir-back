import { ApiProperty } from '@nestjs/swagger';

export class WinterInfoAPI {
  @ApiProperty() prm: string;
  @ApiProperty() data_type: string;
  @ApiProperty() unit: string;
  @ApiProperty({ type: Date }) enedis_reading_date: Date;
  @ApiProperty({ type: Date }) processed_on: Date;
}
export class WinterErrorAPI {
  @ApiProperty() code: string;
  @ApiProperty() message: string;
}
export class WinterDataAPI {
  @ApiProperty({ type: Date }) utc_timestamp: Date;
  @ApiProperty() value: number;
  @ApiProperty() value_at_normal_temperature: number;
  @ApiProperty() value_cumulee: number;
}
export class WinterDataSentAPI {
  @ApiProperty() ok: boolean;
  @ApiProperty({ type: Date }) sent_on: Date;
  @ApiProperty() error: WinterErrorAPI;
  @ApiProperty({ type: WinterInfoAPI }) info: WinterInfoAPI;
  @ApiProperty({ type: [WinterDataAPI] }) data: WinterDataAPI[];
}
export class WinterIncomingDataAPI {
  @ApiProperty() callback_url: string;
  @ApiProperty({ type: [WinterErrorAPI] }) errors: WinterErrorAPI[];
  @ApiProperty() data_sent: WinterDataSentAPI;
}
