import { ApiProperty } from '@nestjs/swagger';
import { SuiviAlimentationAPI, SuiviTransportAPI } from './suiviAPI';

export class SuiviDashboarTotaux {
  @ApiProperty() date: Date;
  @ApiProperty() valeur: number;
}
export class SuiviDashboardAPI {
  @ApiProperty() date_dernier_suivi: Date;
  @ApiProperty() impact_dernier_suivi: number;
  @ApiProperty() variation: number;
  @ApiProperty() dernier_suivi: SuiviAlimentationAPI | SuiviTransportAPI;
  @ApiProperty() moyenne: number;
  @ApiProperty({ type: [SuiviDashboarTotaux] }) type: string;
  derniers_totaux: SuiviDashboarTotaux[];
}
