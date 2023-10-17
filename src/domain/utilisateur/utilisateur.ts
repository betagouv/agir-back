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

  private MAX_LOGIN_ATTEMPT = 3;
  private BLOCKED_DURATION_MIN = 5;

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

  public getLockedUntilString(): string {
    return `${this.prevent_login_before.getUTCHours()}h ${this.prevent_login_before.getUTCMinutes()}min`;
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
      this.prevent_login_before.getMinutes() + this.BLOCKED_DURATION_MIN,
    );
  }

  private failLogin() {
    this.incrementFailedLoginCount();
    if (this.failed_login_count > this.MAX_LOGIN_ATTEMPT) {
      this.incrementNextAllowedLoginTime();
    }
  }

  private initLoginState() {
    this.failed_login_count = 0;
    this.prevent_login_before = new Date();
  }

  private getFailedLoginCount() {
    if (!this.failed_login_count) {
      this.failed_login_count = 0;
    }
    return this.failed_login_count;
  }
  private incrementFailedLoginCount() {
    this.failed_login_count = this.getFailedLoginCount() + 1;
  }
  private getPreventLoginBefore() {
    if (!this.prevent_login_before) {
      this.prevent_login_before = new Date();
    }
    return this.prevent_login_before;
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
