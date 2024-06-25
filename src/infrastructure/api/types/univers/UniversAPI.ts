import { ApiProperty } from '@nestjs/swagger';
import { TuileUnivers } from '../../../../domain/univers/tuileUnivers';

export class UniversAPI {
  @ApiProperty() titre: string;
  @ApiProperty() type: string;
  @ApiProperty() etoiles: number;
  @ApiProperty() is_locked: boolean;
  @ApiProperty() reason_locked: string;
  @ApiProperty() image_url: string;
  @ApiProperty() is_done: boolean;

  public static mapToAPI(uni: TuileUnivers): UniversAPI {
    return {
      titre: uni.titre,
      etoiles: uni.etoiles,
      type: uni.type,
      is_locked: uni.is_locked,
      reason_locked: uni.reason_locked,
      image_url: uni.image_url,
      is_done: uni.is_done,
    };
  }
}
