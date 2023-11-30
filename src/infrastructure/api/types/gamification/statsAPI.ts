import { ApiProperty } from '@nestjs/swagger';
import { Gamification } from '../../../../domain/gamification/gamification';
import { CelebrationType } from '../../../../domain/gamification/celebration';

export class CelebrationAPI {
  @ApiProperty() id: string;
  @ApiProperty({ enum: CelebrationType }) type: CelebrationType;
  @ApiProperty({ required: false }) new_niveau?: number;
}
export class StatsAPI {
  @ApiProperty() points: number;
  @ApiProperty() niveau: number;
  @ApiProperty() current_points_in_niveau: number;
  @ApiProperty() point_target_in_niveau: number;
  @ApiProperty({ type: [CelebrationAPI] }) celebrations: CelebrationAPI[];

  public static mapToStatsAPI(gamif: Gamification): StatsAPI {
    return {
      points: gamif.points,
      niveau: gamif.getNiveau(),
      current_points_in_niveau: gamif.getCurrent_points_in_niveau(),
      point_target_in_niveau: gamif.getPoint_target_in_niveau(),
      celebrations: gamif.celebrations,
    };
  }
}
