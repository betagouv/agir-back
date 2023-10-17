import { Badge } from '../badge/badge';
import { UserQuizzProfile } from '../quizz/userQuizzProfile';
import { OnboardingData } from './onboardingData';
import { OnboardingResult } from './onboardingResult';
var crypto = require('crypto');

export class Utilisateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  passwordHash: string;
  passwordSalt: string;
  onboardingData: OnboardingData;
  onboardingResult: OnboardingResult;
  code_postal: string;
  points: number;
  quizzProfile: UserQuizzProfile;
  created_at: Date;
  badges: Badge[];
  failed_login_count: number;
  prevent_login_before: Date;
  code: string;
  active_account: boolean;
  failed_checkcode_count: number;
  prevent_checkcode_before: Date;

  private MAX_LOGIN_ATTEMPT = 3;
  private MAX_CODE_ATTEMPT = 3;
  private BLOCKED_LOGIN_DURATION_MIN = 5;
  private BLOCKED_CODE_DURATION_MIN = 5;

  constructor(obj: object) {
    Object.assign(this, obj);
  }

  public setPassword(password: string) {
    this.passwordSalt = crypto.randomBytes(16).toString('hex');
    this.passwordHash = crypto
      .pbkdf2Sync(password, this.passwordSalt, 1000, 64, `sha512`)
      .toString(`hex`);
  }

  public isLoginLocked(): boolean {
    return Date.now() < this.getPreventLoginBefore().getTime();
  }
  public isCodeLocked(): boolean {
    return Date.now() < this.getPreventCodeBefore().getTime();
  }

  public getLockedUntilString(): string {
    return this.prevent_login_before.toLocaleTimeString('fr-FR', {
      timeZone: 'Europe/Paris',
      timeStyle: 'short',
      hour12: false,
    });
  }

  public setNew6DigitCode() {
    // FIXME this.code = Math.floor(100000 + Math.random() * 900000).toString();
    // valeur temporaire en dure
    this.code = '123456';
  }
  public checkPasswordOK(password: string) {
    const ok =
      this.passwordHash ===
      crypto
        .pbkdf2Sync(password, this.passwordSalt, 1000, 64, `sha512`)
        .toString(`hex`);
    if (ok) {
      this.initLoginState();
    } else {
      this.failLogin();
    }
    return ok;
  }
  public checkCodeOK(code: string) {
    const ok = this.code === code;
    if (ok) {
      this.validateUser();
    } else {
      this.failCode();
    }
    return ok;
  }

  public static checkEmailFormat(email: string) {
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      throw new Error(`Format de l'adresse électronique ${email} incorrect`);
    }
  }

  public static checkPasswordFormat(password: string) {
    if (!this.auMoinsUnChiffre(password)) {
      throw new Error('Le mot de passe doit contenir au moins un chiffre');
    }
    if (!this.auMoinsDouzeCaracteres(password)) {
      throw new Error('Le mot de passe doit contenir au moins 12 caractères');
    }
    if (!this.auMoinsUnCaractereSpecial(password)) {
      throw new Error(
        'Le mot de passe doit contenir au moins un caractère spécial',
      );
    }
  }

  public incrementNextAllowedLoginTime() {
    if (this.getPreventLoginBefore().getTime() <= Date.now()) {
      this.prevent_login_before = new Date();
    }
    this.prevent_login_before.setMinutes(
      this.prevent_login_before.getMinutes() + this.BLOCKED_LOGIN_DURATION_MIN,
    );
  }
  public incrementNextAllowedCodeTime() {
    if (this.getPreventCodeBefore().getTime() <= Date.now()) {
      this.prevent_checkcode_before = new Date();
    }
    this.prevent_checkcode_before.setMinutes(
      this.prevent_checkcode_before.getMinutes() +
        this.BLOCKED_CODE_DURATION_MIN,
    );
  }

  private failLogin() {
    this.incrementFailedLoginCount();
    if (this.failed_login_count > this.MAX_LOGIN_ATTEMPT) {
      this.incrementNextAllowedLoginTime();
    }
  }
  private failCode() {
    this.incrementFailedCodeCount();
    if (this.failed_checkcode_count > this.MAX_CODE_ATTEMPT) {
      this.incrementNextAllowedCodeTime();
    }
  }

  private initLoginState() {
    this.failed_login_count = 0;
    this.prevent_login_before = new Date();
  }
  private validateUser() {
    this.active_account = true;
  }

  private getFailedLoginCount() {
    if (!this.failed_login_count) {
      this.failed_login_count = 0;
    }
    return this.failed_login_count;
  }
  private getFailedCodeCount() {
    if (!this.failed_checkcode_count) {
      this.failed_checkcode_count = 0;
    }
    return this.failed_checkcode_count;
  }
  private incrementFailedLoginCount() {
    this.failed_login_count = this.getFailedLoginCount() + 1;
  }
  private incrementFailedCodeCount() {
    this.failed_checkcode_count = this.getFailedCodeCount() + 1;
  }
  private getPreventLoginBefore() {
    if (!this.prevent_login_before) {
      this.prevent_login_before = new Date();
    }
    return this.prevent_login_before;
  }
  private getPreventCodeBefore() {
    if (!this.prevent_checkcode_before) {
      this.prevent_checkcode_before = new Date();
    }
    return this.prevent_checkcode_before;
  }
  private static auMoinsUnCaractereSpecial(password: string | null): boolean {
    const regexp = new RegExp(
      /([(&~»#)‘\-_`{[|`_\\^@)\]=}+%*$£¨!§/:;.?¿'"!,§éèêëàâä»])+/,
      'g',
    );
    return password ? regexp.test(password) : false;
  }

  private static auMoinsDouzeCaracteres(password: string | null): boolean {
    const regexp = new RegExp(/(?=.{12,}$)/, 'g');
    return password ? regexp.test(password) : false;
  }

  private static auMoinsUnChiffre(password: string | null): boolean {
    const regexp = new RegExp(/([0-9])+/, 'g');
    return password ? regexp.test(password) : false;
  }
}
