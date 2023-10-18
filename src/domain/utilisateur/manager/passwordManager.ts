var crypto = require('crypto');

export type PasswordAwareUtilisateur = {
  passwordHash: string;
  passwordSalt: string;
  failed_login_count: number;
  prevent_login_before: Date;
};

export class PasswordManager {
  private static MAX_LOGIN_ATTEMPT = 3;
  private static BLOCKED_LOGIN_DURATION_MIN = 5;

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

  public static setUserPassword(
    utilisateur: PasswordAwareUtilisateur,
    password: string,
  ) {
    utilisateur.passwordSalt = crypto.randomBytes(16).toString('hex');
    utilisateur.passwordHash = crypto
      .pbkdf2Sync(password, utilisateur.passwordSalt, 1000, 64, `sha512`)
      .toString(`hex`);
  }

  public static checkUserPasswordOKAndChangeState(
    utilisateur: PasswordAwareUtilisateur,
    password: string,
  ): boolean {
    const ok =
      utilisateur.passwordHash ===
      crypto
        .pbkdf2Sync(password, utilisateur.passwordSalt, 1000, 64, `sha512`)
        .toString(`hex`);
    if (ok) {
      PasswordManager.initLoginState(utilisateur);
    } else {
      PasswordManager.failLogin(utilisateur);
    }
    return ok;
  }

  public static isLoginLocked(utilisateur: PasswordAwareUtilisateur): boolean {
    return Date.now() < utilisateur.prevent_login_before.getTime();
  }

  public static getLoginLockedUntilString(
    utilisateur: PasswordAwareUtilisateur,
  ): string {
    return utilisateur.prevent_login_before.toLocaleTimeString('fr-FR', {
      timeZone: 'Europe/Paris',
      timeStyle: 'short',
      hour12: false,
    });
  }

  private static initLoginState(utilisateur: PasswordAwareUtilisateur) {
    utilisateur.failed_login_count = 0;
    utilisateur.prevent_login_before = new Date();
  }

  private static failLogin(utilisateur: PasswordAwareUtilisateur) {
    utilisateur.failed_login_count++;
    if (utilisateur.failed_login_count > PasswordManager.MAX_LOGIN_ATTEMPT) {
      PasswordManager.incrementNextAllowedLoginTime(utilisateur);
    }
  }

  private static incrementNextAllowedLoginTime(
    utilisateur: PasswordAwareUtilisateur,
  ) {
    if (utilisateur.prevent_login_before.getTime() <= Date.now()) {
      utilisateur.prevent_login_before = new Date();
    }
    utilisateur.prevent_login_before.setMinutes(
      utilisateur.prevent_login_before.getMinutes() +
        PasswordManager.BLOCKED_LOGIN_DURATION_MIN,
    );
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
