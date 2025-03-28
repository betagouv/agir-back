import metadata from './metadata.json';

export class App {
  static USER_CURRENT_VERSION = 14;
  static BACK_CURRENT_VERSION = '1';

  public static currentUserSystemVersion(): number {
    return App.USER_CURRENT_VERSION;
  }
  public static getBackCurrentVersion(): string {
    return App.BACK_CURRENT_VERSION;
  }
  public static defiEnabled(): boolean {
    return process.env.DEFI_ENABLED === 'true';
  }
  public static kycRecoEnabled(): boolean {
    return process.env.KYC_RECO_ENABLED === 'true';
  }
  public static isProd(): boolean {
    return process.env.IS_PROD === 'true';
  }
  public static getFixedOTP_DEVCode(): string {
    return process.env.OTP_DEV;
  }
  public static getServiceActifsStringList() {
    return process.env.SERVICES_ACTIFS || '';
  }
  public static isAdmin(userId: string): boolean {
    return !!process.env.ADMIN_IDS && process.env.ADMIN_IDS.includes(userId);
  }

  public static listEmailsWarningAideExpiration(): string[] {
    if (process.env.EMAILS_WARNING_AIDE_EXPIRATION) {
      return process.env.EMAILS_WARNING_AIDE_EXPIRATION.split(',');
    } else {
      return [];
    }
  }
  public static isMailEnabled(): boolean {
    return process.env.EMAIL_ENABLED === 'true';
  }
  public static isWinterAPIEnabled(): boolean {
    return process.env.WINTER_API_ENABLED === 'true';
  }
  public static getWinterAPIKey(): string {
    return process.env.WINTER_API_KEY;
  }
  public static getWinterApiURL(): string {
    return process.env.WINTER_URL;
  }
  public static areServiceAPIEnabled(): boolean {
    return process.env.SERVICE_APIS_ENABLED === 'true';
  }
  public static getFruitsLegumesAPIKEY(): string {
    return process.env.FRUITS_LEGUMES_API_KEY;
  }
  public static getOpenRouteAPIKEY(): string {
    return process.env.OPEN_ROUTE_API_KEY;
  }

  public static getBaseURLFront(): string {
    return process.env.BASE_URL_FRONT ? process.env.BASE_URL_FRONT : '';
  }
  public static getBaseURLBack(): string {
    return process.env.BASE_URL;
  }

  public static getCmsApiKey(): string {
    return process.env.CMS_API_KEY;
  }

  public static getCmsURL(): string {
    return process.env.CMS_URL;
  }
  public static getCmsBaseURL(): string {
    return process.env.CMS_BASE_URL;
  }
  public static getCmsAidePreviewURL(): string {
    return process.env.CMS_AIDE_PREVIEW_URL;
  }

  public static getAideVeloMiniaturesURL(): string {
    return process.env.MINIATURES_URL;
  }

  public static getBrevoApiToken(): string {
    return process.env.EMAIL_API_TOKEN;
  }
  public static getWelcomeListId(): number {
    return parseInt(process.env.BREVO_BREVO_WELCOME_LIST_ID);
  }

  public static getJWTSecret(): string {
    return process.env.INTERNAL_TOKEN_SECRET;
  }
  public static getCMSWebhookAPIKey(): string {
    return process.env.CMS_WEBHOOK_API_KEY;
  }
  public static getCronAPIKey(): string {
    return process.env.CRON_API_KEY;
  }
  public static getEmailReplyTo(): string {
    return process.env.EMAIL_REPLY_TO;
  }
  public static getEmailContact(): string {
    return process.env.EMAIL_CONTACT;
  }
  public static getCurrentPonderationRubriqueSetName(): string {
    return process.env.PONDERATION_RUBRIQUES;
  }
  public static getInactiveNotificationsListe(): string {
    return process.env.NOTIFICATIONS_MAIL_INACTIVES || '';
  }
  public static getBasicLogin(): string {
    return process.env.BASIC_LOGIN || '';
  }
  public static getBasicPassword(): string {
    return process.env.BASIC_PASSWORD || '';
  }
  public static getGoogleTestEmail(): string {
    return process.env.GOOGLE_TEST_EMAIL || '';
  }
  public static getGoogleTestOTP(): string {
    return process.env.GOOGLE_TEST_OTP || '';
  }
  public static getAppleTestEmail(): string {
    return process.env.APPLE_TEST_EMAIL || '';
  }
  public static getAppleTestOTP(): string {
    return process.env.APPLE_TEST_OTP || '';
  }
  public static getNGC_API_KEY(): string {
    return process.env.NGC_API_KEY || '';
  }
  public static getLVO_API_URL(): string {
    return process.env.LVO_API_URL || '';
  }
  public static getThrottleLimit(): number {
    return parseInt(process.env.THROTTLE_LIMIT) ?? 2;
  }

  public static gainContentPoint(): boolean {
    return process.env.GAIN_CONTENT_POINT === 'true';
  }

  public static getBasicLoginPwdBase64(): string {
    const login = this.getBasicLogin();
    const pwd = this.getBasicPassword();
    return btoa(login + ':' + pwd);
  }
  public static getAppVersion(): {
    major: number;
    minor: number;
    patch: number;
  } {
    return metadata.version;
  }
}
