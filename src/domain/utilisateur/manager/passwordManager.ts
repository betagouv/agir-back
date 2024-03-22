var crypto = require('crypto');
import { Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../../src/infrastructure/applicationError';
import { UtilisateurSecurityRepository } from '../../../infrastructure/repository/utilisateur/utilisateurSecurity.repository';
import { PasswordAwareUtilisateur } from './passwordAwareUtilisateur';

@Injectable()
export class PasswordManager {
  constructor(private securityRepository: UtilisateurSecurityRepository) {}

  private static MAX_LOGIN_ATTEMPT = 3;
  private static BLOCKED_LOGIN_DURATION_MIN = 5;

  public async loginUtilisateur(
    utilisateur: PasswordAwareUtilisateur,
    password: string,
    okAction: Function,
  ): Promise<any> {
    PasswordManager.checkLoginLocked(utilisateur);

    const login_ok = await this.checkUserPasswordOKAndUpdateState(
      utilisateur,
      password,
    );

    if (login_ok) {
      return okAction();
    } else {
      PasswordManager.checkLoginLocked(utilisateur);
      ApplicationError.throwBadPasswordOrEmailError();
    }
  }

  public static checkPasswordFormat(password: string) {
    if (!this.auMoinsUnChiffre(password)) {
      ApplicationError.throwPasswordOneDigit();
    }
    if (!this.auMoinsUneMinuscule(password)) {
      ApplicationError.throwPasswordOneLowerCase();
    }
    if (!this.auMoinsUneMajuscule(password)) {
      ApplicationError.throwPasswordUpperCase();
    }
    if (!this.auMoinsDouzeCaracteres(password)) {
      ApplicationError.throwPassword12Char();
    }
    if (!this.auMoinsUnCaractereSpecial(password)) {
      ApplicationError.throwPasswordCharSpe();
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

  public async initLoginState(utilisateur: PasswordAwareUtilisateur) {
    utilisateur.failed_login_count = 0;
    utilisateur.prevent_login_before = new Date();
    await this.securityRepository.updateLoginAttemptData(utilisateur);
  }

  private static checkLoginLocked(utilisateur: PasswordAwareUtilisateur) {
    if (PasswordManager.isLoginLocked(utilisateur)) {
      ApplicationError.throwTropEssaisCompteBloque(
        PasswordManager.lockedUntilString(utilisateur),
      );
    }
  }

  private async checkUserPasswordOKAndUpdateState(
    utilisateur: PasswordAwareUtilisateur,
    password: string,
  ): Promise<boolean> {
    const ok =
      utilisateur.passwordHash ===
      crypto
        .pbkdf2Sync(password, utilisateur.passwordSalt, 1000, 64, `sha512`)
        .toString(`hex`);
    if (ok) {
      await this.initLoginState(utilisateur);
    } else {
      await this.failLogin(utilisateur);
    }
    return ok;
  }

  private static isLoginLocked(utilisateur: PasswordAwareUtilisateur): boolean {
    return Date.now() < utilisateur.prevent_login_before.getTime();
  }

  private static lockedUntilString(
    utilisateur: PasswordAwareUtilisateur,
  ): string {
    return utilisateur.prevent_login_before.toLocaleTimeString('fr-FR', {
      timeZone: 'Europe/Paris',
      timeStyle: 'short',
      hour12: false,
    });
  }

  private async failLogin(utilisateur: PasswordAwareUtilisateur) {
    utilisateur.failed_login_count++;
    if (utilisateur.failed_login_count > PasswordManager.MAX_LOGIN_ATTEMPT) {
      PasswordManager.incrementNextAllowedLoginTime(utilisateur);
    }
    await this.securityRepository.updateLoginAttemptData(utilisateur);
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
    return password ? password.length >= 12 : false;
  }

  private static auMoinsUnChiffre(password: string | null): boolean {
    const regexp = new RegExp(/([0-9])+/, 'g');
    return password ? regexp.test(password) : false;
  }
  private static auMoinsUneMinuscule(password: string | null): boolean {
    const regexp = new RegExp(/([a-z])+/, 'g');
    return password ? regexp.test(password) : false;
  }
  private static auMoinsUneMajuscule(password: string | null): boolean {
    const regexp = new RegExp(/([A-Z])+/, 'g');
    return password ? regexp.test(password) : false;
  }
}
