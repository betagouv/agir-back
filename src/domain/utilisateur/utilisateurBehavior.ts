import { ApplicativePonderationSetName } from '../scoring/ponderationApplicative';

export class UtilisateurBehavior {
  public static currentUserSystemVersion(): number {
    return Number.parseInt(process.env.USER_CURRENT_VERSION) || 0;
  }
}
