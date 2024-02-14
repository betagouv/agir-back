import { ApiProperty } from '@nestjs/swagger';
import { LinkyDataElement } from '../../../../../src/domain/linky/linkyData';

export enum LinkyDataDetailAPI {
  jour = 'jour',
  semaine = 'semaine',
  mois = 'mois',
  annee = 'annee',
}

export class LinkyDataAPI {
  @ApiProperty() date: Date;
  @ApiProperty() valeur: number;
  @ApiProperty() valeur_corrigee: number;
  @ApiProperty() jour?: string;
  @ApiProperty() jour_val?: number;
  @ApiProperty() semaine?: string;
  @ApiProperty() mois?: string;
  @ApiProperty() annee?: string;

  public static map(elem: LinkyDataElement): LinkyDataAPI {
    return {
      date: elem.time,
      valeur: elem.value,
      valeur_corrigee: elem.value_at_normal_temperature,
      jour: elem.jour_text,
      jour_val: elem.jour_val,
      semaine: elem.semaine,
      mois: elem.mois,
      annee: elem.annee,
    };
  }
}
