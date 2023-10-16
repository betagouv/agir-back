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

  constructor(obj: object) {
    Object.assign(this, obj);
  }

  public failedLogin() {
    if (!this.failed_login_count) {
      this.failed_login_count = 0;
    }
    this.failed_login_count += 1;
    if (this.failed_login_count > 3) {
      this.prevent_login_before = this.prevent_login_before
        ? this.prevent_login_before
        : new Date();
      this.prevent_login_before.setMinutes(
        this.prevent_login_before.getMinutes() + 5,
      );
    }
  }

  public setPassword(password: string) {
    this.passwordSalt = crypto.randomBytes(16).toString('hex');
    this.passwordHash = crypto
      .pbkdf2Sync(password, this.passwordSalt, 1000, 64, `sha512`)
      .toString(`hex`);
  }

  public isLoginLocked(): boolean {
    return (
      !!this.prevent_login_before &&
      new Date().getTime() < this.prevent_login_before.getTime()
    );
  }

  public getLockedUntilString(): string {
    return `${this.prevent_login_before.getHours()}h ${this.prevent_login_before.getMinutes()}min`;
  }
  public isPasswordOK(password: string) {
    return (
      this.passwordHash ===
      crypto
        .pbkdf2Sync(password, this.passwordSalt, 1000, 64, `sha512`)
        .toString(`hex`)
    );
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
