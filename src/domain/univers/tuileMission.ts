import { Thematique } from '../contenu/thematique';

export class TuileMission {
  titre: string;
  code: string;
  progression: number;
  cible_progression: number;
  is_new: boolean;
  is_first: boolean;
  image_url: string;
  thematique: Thematique;

  constructor(data: TuileMission) {
    Object.assign(this, data);
  }

  public isDone?(): boolean {
    return this.progression === this.cible_progression;
  }
  public isInProgress?(): boolean {
    return !this.isDone() && !this.is_new;
  }
}
