import { ApiProperty } from '@nestjs/swagger';
import { Gamification } from '../../../../domain/gamification';
import { CelebrationType } from './celebration';

export class CelebrationAPI {
  @ApiProperty() id: string;
  @ApiProperty({ enum: CelebrationType }) type: CelebrationType;
  @ApiProperty() new_niveau: number;
}
export class StatsAPI {
  @ApiProperty() points: number;
  @ApiProperty() niveau: number;
  @ApiProperty() current_points_in_niveau: number;
  @ApiProperty() point_target_in_niveau: number;
  @ApiProperty({ type: [CelebrationAPI] }) celebrations: CelebrationAPI[];

  public static mapToStatsAPI(stats: Gamification): StatsAPI {
    return {
      points: stats.points,
      niveau: stats.niveau,
      current_points_in_niveau: stats.current_points_in_niveau,
      point_target_in_niveau: stats.point_target_in_niveau,
      celebrations: stats.celebrations,
    };
  }
}
