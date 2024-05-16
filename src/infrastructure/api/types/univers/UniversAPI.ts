import { ApiProperty } from '@nestjs/swagger';
import { TuileUnivers } from '../../../../domain/univers/tuileUnivers';
import { Univers } from '../../../../domain/univers/univers';

export class UniversAPI {
  @ApiProperty() titre: string;
  @ApiProperty({ enum: Univers }) type: Univers;
  @ApiProperty() etoiles: number;
  @ApiProperty() is_locked: boolean;
  @ApiProperty() reason_locked: string;
  @ApiProperty() image_url: string;

  public static mapToAPI(uni: TuileUnivers): UniversAPI {
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
