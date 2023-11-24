import { Celebration } from '../../src/infrastructure/api/types/gamification/celebration';

export class Stats {
  points: number;
  niveau: number;
  current_points_in_niveau: number;
  point_target_in_niveau: number;
  celebrations: Celebration[];
}
