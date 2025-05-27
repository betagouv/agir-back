import { ApiProperty } from '@nestjs/swagger';
import { Explication } from '../../../../domain/scoring/system_v2/ExplicationScore';

export class ExplicationRecoAPI {
  @ApiProperty() inclusion_tag?: string;
  @ApiProperty() exclusion_tag?: string;
  @ApiProperty() valeur?: number;
  @ApiProperty() ponderation?: number;
  @ApiProperty() est_local?: boolean;
  @ApiProperty() est_boost?: boolean;

  static mapToApi(exp: Explication): ExplicationRecoAPI {
    return {
      est_boost: exp.est_boost,
      est_local: exp.est_local,
      exclusion_tag: exp.exclusion_tag,
      inclusion_tag: exp.inclusion_tag,
      ponderation: exp.ponderation,
      valeur: exp.valeur,
    };
  }
}
