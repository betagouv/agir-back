import { Celebration } from '../infrastructure/api/types/gamification/celebration';

export class GamificationData {
  points: number;
  niveau: number;
  current_points_in_niveau: number;
  point_target_in_niveau: number;
  celebrations: Celebration[];
}
export class Gamification extends GamificationData {
  constructor(data: GamificationData) {
    super();
    Object.assign(this, data);
  }

  public ajoutePoints?(new_points: number) {
    this.points += new_points;
  }

  public static newDefaultGamification(): Gamification {
    return new Gamification({
      points: 0,
      niveau: 1,
      current_points_in_niveau: 0,
      point_target_in_niveau: 5,
      celebrations: [],
    });
  }
}
