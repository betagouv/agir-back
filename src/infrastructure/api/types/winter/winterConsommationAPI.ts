import { ApiProperty } from '@nestjs/swagger';
import {
  ConsommationElectrique,
  TypeUsage,
} from '../../../../domain/linky/consommationElectrique';

export class WinterUsageAPI {
  @ApiProperty({ enum: TypeUsage }) type: TypeUsage;
  @ApiProperty() eur: number;
  @ApiProperty() percent: number;
}

export class WinterConsommationAPI {
  @ApiProperty() consommation_totale_euros: number;
  @ApiProperty() economies_possibles_euros: number;
  @ApiProperty() nombre_actions_associees: number;
  @ApiProperty({ type: [WinterUsageAPI] }) detail_usages: WinterUsageAPI[];

  public static mapToAPI(conso: ConsommationElectrique): WinterConsommationAPI {
    let eco_total = 0;
    for (const usage of conso.detail_usages) {
      eco_total += usage.eur;
    }
    return {
      consommation_totale_euros: conso.consommation_totale_euros,
      economies_possibles_euros: eco_total,
      nombre_actions_associees: conso.nombre_actions_associees,
      detail_usages: conso.detail_usages.map((c) => ({
        eur: c.eur,
        percent: c.percent,
        type: c.type,
      })),
    };
  }
}
