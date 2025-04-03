import { Gamification } from '../../../../src/domain/gamification/gamification';
import { TypeBadge } from '../../gamification/typeBadge';
import { Versioned_v0 } from '../versioned';

export class Gamification_v0 extends Versioned_v0 {
  points: number;
  popup_reset_vue: boolean;
  badges: TypeBadge[];

  constructor() {
    super();
    this.points = 0;
    this.popup_reset_vue = true;
    this.badges = [];
  }

  static serialise(domain: Gamification): Gamification_v0 {
    return {
      version: 0,
      points: domain.getPoints(),
      popup_reset_vue: domain.isPopupResetVue(),
      badges: domain.getBadges(),
    };
  }
}
