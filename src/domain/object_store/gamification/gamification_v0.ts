import {
  Celebration,
  CelebrationType,
} from '../../../../src/domain/gamification/celebrations/celebration';
import { Reveal } from '../../../../src/domain/gamification/celebrations/reveal';
import { Feature } from '../../../../src/domain/gamification/feature';
import { Gamification } from '../../../../src/domain/gamification/gamification';
import { Versioned_v0 } from '../versioned';

export class Reveal_v0 {
  id: string;
  feature: Feature;
  titre: string;
  description: string;

  static map(elem: Reveal): Reveal_v0 {
    return {
      id: elem.id,
      feature: elem.feature,
      titre: elem.titre,
      description: elem.description,
    };
  }
}

export class Celebration_v0 {
  id: string;
  type: CelebrationType;
  titre: string;
  reveal?: Reveal_v0;
  new_niveau?: number;
  new_thematiques?: string[];
  thematique_univers?: string;

  static map(elem: Celebration): Celebration_v0 {
    return {
      id: elem.id,
      type: elem.type,
      titre: elem.titre,
      reveal: elem.reveal ? Reveal_v0.map(elem.reveal) : undefined,
      new_niveau: elem.new_niveau,
      new_thematiques: elem.new_thematiques,
      thematique_univers: elem.thematique_univers,
    };
  }
}

export class Gamification_v0 extends Versioned_v0 {
  points: number;
  celebrations: Celebration_v0[];
  popup_reset_vue: boolean;

  constructor() {
    super();
    this.points = 0;
    this.celebrations = [];
  }

  static serialise(domain: Gamification): Gamification_v0 {
    return {
      version: 0,
      points: domain.getPoints(),
      celebrations: domain.celebrations.map((e) => Celebration_v0.map(e)),
      popup_reset_vue: domain.isPopupResetVue(),
    };
  }
}
