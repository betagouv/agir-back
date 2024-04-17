import { ApiProperty } from '@nestjs/swagger';
import { LinkyDataElement } from '../../../../../src/domain/linky/linkyData';

export enum LinkyDataDetailAPI {
  jour = 'jour',
  semaine = 'semaine',
  mois = 'mois',
  annee = 'annee',
}

export class LinkyRawDataAPI {
  @ApiProperty() date: Date;
  @ApiProperty() valeur: number;
  @ApiProperty() valeur_corrigee: number;
  @ApiProperty() jour?: string;
  @ApiProperty() jour_val?: number;
  @ApiProperty() semaine?: string;
  @ApiProperty() mois?: string;
  @ApiProperty() annee?: string;

  public static map(elem: LinkyDataElement): LinkyRawDataAPI {
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

export class LinkyDataAPI {
  @ApiProperty({ type: [LinkyRawDataAPI] }) data: LinkyRawDataAPI[];
  @ApiProperty() commentaires?: string[];

  public static map(
    data: LinkyDataElement[],
    commentaires: string[],
  ): LinkyDataAPI {
    return {
      data: data.map((elem) => LinkyRawDataAPI.map(elem)),
      commentaires: commentaires ? commentaires : [],
    };
  }
}
