import { ApiProperty } from '@nestjs/swagger';
import { UniversType } from '../../../../../src/domain/univers/universType';

export class UniversAPI {
  @ApiProperty() titre: string;
  @ApiProperty({ enum: UniversType }) type: UniversType;
  @ApiProperty() etoiles: string;
  @ApiProperty() is_locked: boolean;
  @ApiProperty() reason_locked: string;

  public static mapToAPI(uni: any): UniversAPI {
    return {
      titre: uni.titre,
      etoiles: uni.etoiles,
      type: uni.type,
      is_locked: uni.is_locked,
      reason_locked: uni.reason_locked,
    };
  }
}
