import { ApiProperty } from '@nestjs/swagger';
import {
  ConsommationElectrique,
  TypeUsage,
} from '../../../../domain/linky/consommationElectrique';

export type WinterUsageAPI = {
  type: TypeUsage;
  eur: number;
  percent: number;
};

export class WinterConsommationAPI {
  @ApiProperty() consommation_totale_euros: number;
  @ApiProperty() economies_possibles_euros: number;
  @ApiProperty() detail_usages: WinterUsageAPI[];

  public static mapToAPI(conso: ConsommationElectrique): WinterConsommationAPI {
    let eco_total = 0;
    for (const usage of conso.detail_usages) {
      eco_total += usage.eur;
    }
    return {
      consommation_totale_euros: conso.consommation_totale_euros,
      economies_possibles_euros: eco_total,
      detail_usages: conso.detail_usages.map((c) => ({
        eur: c.eur,
        percent: c.percent,
        type: c.type,
      })),
    };
  }
}
