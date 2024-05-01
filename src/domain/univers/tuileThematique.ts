import { ThematiqueUnivers } from './thematiqueUnivers';

export class TuileThematique {
  titre: string;
  type: ThematiqueUnivers;
  progression: number;
  cible_progression: number;
  is_locked: boolean;
  reason_locked: string;
  is_new: boolean;
  niveau: number;
}
