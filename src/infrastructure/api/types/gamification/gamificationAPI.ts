import { ApiProperty } from '@nestjs/swagger';
import { Gamification } from '../../../../domain/gamification/gamification';
import { CelebrationType } from '../../../../domain/gamification/celebrations/celebration';
import { RevealType } from '../../../../../src/domain/gamification/celebrations/reveal';

export class CelebrationAPI {
  @ApiProperty() id: string;
  @ApiProperty({ enum: CelebrationType }) type: CelebrationType;
  @ApiProperty() titre: string;
  @ApiProperty({ required: false }) new_niveau?: number;
}
export class RevealAPI {
  @ApiProperty() id: string;
  @ApiProperty({ enum: RevealType }) type: RevealType;
  @ApiProperty() titre: string;
}
export class GamificationAPI {
  @ApiProperty() points: number;
  @ApiProperty() niveau: number;
  @ApiProperty() current_points_in_niveau: number;
  @ApiProperty() point_target_in_niveau: number;
  @ApiProperty({ type: [CelebrationAPI] }) celebrations: CelebrationAPI[];
  @ApiProperty({ type: [RevealAPI] }) reveals: RevealAPI[];

  public static mapToStatsAPI(gamif: Gamification): GamificationAPI {
    return {
      points: gamif.points,
      niveau: gamif.getNiveau(),
      current_points_in_niveau: gamif.getCurrent_points_in_niveau(),
      point_target_in_niveau: gamif.getPoint_target_in_niveau(),
      celebrations: gamif.celebrations,
      reveals: gamif.reveals,
    };
  }
}
