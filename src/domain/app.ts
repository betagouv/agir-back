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
  public static isProd(): boolean {
    return process.env.IS_PROD === 'true';
  }
  public static isFirstStart(): boolean {
    return process.env.FIRST_START === 'true';
  }
  public static getFixedOTP_DEVCode(): string {
    return process.env.OTP_DEV;
  }
  public static getServiceActifsStringList() {
    return process.env.SERVICES_ACTIFS || '';
  }
  public static isAdmin(userId: string): boolean {
    return process.env.ADMIN_IDS.includes(userId);
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
  public static areCachedUnivers(): boolean {
    return process.env.UNIVERS_CACHE_ENABLED === 'true';
  }
  public static getEcoWattApiSecret(): string {
    return process.env.ECOWATT_CLIENT_ID_SECRET;
  }

  public static getBaseURLFront(): string {
    return process.env.BASE_URL_FRONT;
  }

  public static isWhiteListeEnabled(): boolean {
    return process.env.WHITE_LIST_ENABLED === 'true';
  }
  public static doesAnyWhiteListIncludes(email: string): boolean {
    const access_1 = App.doesWhiteListIncludes(email);
    const access_2 = App.doesWhiteListDijonIncludes(email);
    return access_1 || access_2;
  }
  public static doesWhiteListIncludes(email: string): boolean {
    return (
      !!process.env.WHITE_LIST &&
      process.env.WHITE_LIST.toLowerCase().includes(email.toLocaleLowerCase())
    );
  }
  public static doesWhiteListDijonIncludes(email: string): boolean {
    return (
      !!process.env.WHITE_LIST_DIJON &&
      process.env.WHITE_LIST_DIJON.toLowerCase().includes(
        email.toLocaleLowerCase(),
      )
    );
  }
  public static getCmsApiKey(): string {
    return process.env.CMS_API_KEY;
  }

  public static getCmsURL(): string {
    return process.env.CMS_URL;
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
  public static getCurrentPonderationRubriqueSetName(): string {
    return process.env.PONDERATION_RUBRIQUES;
  }
  public static getMaxFileAttenteJour(): number {
    return Number.parseInt(process.env.MAX_ATTENTE_JOUR) || 0;
  }
}
