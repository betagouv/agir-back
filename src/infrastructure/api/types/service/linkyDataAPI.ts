import { ApiProperty } from '@nestjs/swagger';
import { LinkyDataElement } from 'src/domain/linky/linkyData';

export class LinkyDataAPI {
  @ApiProperty() date: Date;
  @ApiProperty() valeur: number;
  @ApiProperty() valeur_corrigee: number;

  public static map(elem: LinkyDataElement): LinkyDataAPI {
    return {
      date: elem.time,
      valeur: elem.value,
      valeur_corrigee: elem.value_at_normal_temperature,
    };
  }
}
