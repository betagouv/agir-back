import { ThematiqueUniversType } from './thematiqueUniversType';

export class ThematiqueUnivers {
  titre: string;
  type: ThematiqueUniversType;
  progression: number;
  cible_progression: number;
  is_locked: boolean;
  reason_locked: string;
  is_new: boolean;
  niveau: number;
}
