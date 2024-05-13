import { ThematiqueUnivers } from './thematiqueUnivers';
import { Univers } from './univers';

export class TuileThematique {
  titre: string;
  type: ThematiqueUnivers;
  progression: number;
  cible_progression: number;
  is_locked: boolean;
  reason_locked: string;
  is_new: boolean;
  niveau: number;
  image_url: string;
  univers_parent: Univers;
  univers_parent_label: string;

  constructor(data: TuileThematique) {
    Object.assign(this, data);
  }
}
