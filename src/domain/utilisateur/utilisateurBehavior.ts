import { ApplicativePonderationSetName } from '../scoring/ponderationApplicative';

export class UtilisateurBehavior {
  public static currentUserSystemVersion(): number {
    return Number.parseInt(process.env.USER_CURRENT_VERSION) || 0;
  }
  public static defiEnabled(): boolean {
    return process.env.DEFI_ENABLED === 'true';
  }
  public static kycRecoEnabled(): boolean {
    return process.env.KYC_RECO_ENABLED === 'true';
  }
}
