import { ApiProperty } from '@nestjs/swagger';
import { Stats } from 'src/domain/stats';

export class StatsAPI {
  @ApiProperty() points: number;
  @ApiProperty() niveau: number;
  @ApiProperty() current_points_in_niveau: number;
  @ApiProperty() point_target_in_niveau: number;

  public static mapToStatsAPI(stats: Stats): StatsAPI {
    return {
      points: stats.points,
      niveau: stats.niveau,
      current_points_in_niveau: stats.current_points_in_niveau,
      point_target_in_niveau: stats.point_target_in_niveau,
    };
  }
}
