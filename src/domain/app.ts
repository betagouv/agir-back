import { ApplicativePonderationSetName } from './scoring/ponderationApplicative';

export class App {
  public static currentUserSystemVersion(): number {
    return Number.parseInt(process.env.USER_CURRENT_VERSION) || 0;
  }
  public static defiEnabled(): boolean {
    return process.env.DEFI_ENABLED === 'true';
  }
  public static kycRecoEnabled(): boolean {
    return process.env.KYC_RECO_ENABLED === 'true';
  }
  public static aide_cache_enabled(): boolean {
    return process.env.AIDE_CACHE_ENABLED === 'true';
  }
  public static isProd() {
    return process.env.IS_PROD === 'true';
  }
  public static getFixedOTP_DEVCode(): string {
    return process.env.OTP_DEV;
  }
  public static getServiceActifsStringList() {
    return process.env.SERVICES_ACTIFS || '';
  }
  public static getAdminIdsStringList() {
    return process.env.ADMIN_IDS || '';
  }
}
