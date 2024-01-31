export class Environment {
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
