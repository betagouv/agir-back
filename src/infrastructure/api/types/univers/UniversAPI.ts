import { ApiProperty } from '@nestjs/swagger';
import { Univers } from '../../../../../src/domain/univers/univers';
import { UniversType } from '../../../../../src/domain/univers/universType';

export class UniversAPI {
  @ApiProperty() titre: string;
  @ApiProperty({ enum: UniversType }) type: UniversType;
  @ApiProperty() etoiles: number;
  @ApiProperty() is_locked: boolean;
  @ApiProperty() reason_locked: string;
  @ApiProperty() image_url: string;

  public static mapToAPI(uni: Univers): UniversAPI {
    return {
      titre: uni.titre,
      etoiles: uni.etoiles,
      type: uni.type,
      is_locked: uni.is_locked,
      reason_locked: uni.reason_locked,
      image_url: uni.image_url,
    };
  }
}
