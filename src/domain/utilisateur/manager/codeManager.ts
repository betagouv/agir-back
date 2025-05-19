import { Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../../src/infrastructure/applicationError';
import { UtilisateurSecurityRepository } from '../../../infrastructure/repository/utilisateur/utilisateurSecurity.repository';
import { App } from '../../app';
import { CodeAwareUtilisateur } from './codeAwareUtilisateur';
var crypto = require('crypto');

@Injectable()
export class CodeManager {
  constructor(private securityRepository: UtilisateurSecurityRepository) {}

  private static MAX_CODE_ATTEMPT = 3;
  private static BLOCKED_CODE_DURATION_MIN = 5;
  private static CODE_VALIDITY_TIME_MS = 10 * 60 * 1000;

  public static setNew6DigitCode(utilisateur: CodeAwareUtilisateur) {
    if (App.isProd()) {
      utilisateur.code = CodeManager.random6Digit();
    } else {
      utilisateur.code = App.getFixedOTP_DEVCode();
    }
  }

  public async processInputCodeAndDoActionIfOK(
    code: string,
    utilisateur: CodeAwareUtilisateur,
    okAction: Function,
  ): Promise<any> {
    CodeManager.checkCodeLocked(utilisateur);

    const code_ok = await this.checkCodeOKAndUpdateStates(utilisateur, code);

    if (code_ok) {
      return okAction();
    } else {
      console.log(
        `CONNEXION : validateCodePourLogin : [${utilisateur.id}] bad code`,
      );
      CodeManager.checkCodeLocked(utilisateur);
      ApplicationError.throwBadCodeOrEmailError();
    }
  }

  private async checkCodeOKAndUpdateStates(
    utilisateur: CodeAwareUtilisateur,
    code: string,
  ): Promise<boolean> {
    let ok: boolean;
    if (utilisateur.email === App.getGoogleTestEmail()) {
      ok = App.getGoogleTestOTP() === code;
    } else if (utilisateur.email === App.getAppleTestEmail()) {
      ok = App.getAppleTestOTP() === code;
    } else {
      ok =
        utilisateur.code === code &&
        utilisateur.code_generation_time.getTime() >
          Date.now() - CodeManager.CODE_VALIDITY_TIME_MS;
    }
    if (!ok) {
      CodeManager.failCode(utilisateur);
      await this.securityRepository.updateCodeValidationData(utilisateur);
    } else {
      CodeManager.successCode(utilisateur);
      await this.securityRepository.updateCodeValidationData(utilisateur);
    }
    return ok;
  }

  public async initCodeStateAfterSuccess(utilisateur: CodeAwareUtilisateur) {
    utilisateur.failed_checkcode_count = 0;
    utilisateur.prevent_checkcode_before = new Date();
    utilisateur.code = null;
    await this.securityRepository.updateCodeValidationData(utilisateur);
  }

  private static checkCodeLocked(utilisateur: CodeAwareUtilisateur) {
    const isLocked =
      Date.now() < utilisateur.prevent_checkcode_before.getTime();

    if (isLocked) {
      ApplicationError.throwToManyAttemptsError(
        CodeManager.lockedUntilString(utilisateur),
      );
    }
  }

  private static lockedUntilString(utilisateur: CodeAwareUtilisateur): string {
    return utilisateur.prevent_checkcode_before.toLocaleTimeString('fr-FR', {
      timeZone: 'Europe/Paris',
      timeStyle: 'short',
      hour12: false,
    });
  }

  private static failCode(utilisateur: CodeAwareUtilisateur) {
    utilisateur.failed_checkcode_count++;
    if (utilisateur.failed_checkcode_count > this.MAX_CODE_ATTEMPT) {
      CodeManager.incrementNextAllowedCodeTime(utilisateur);
    }
  }
  private static successCode(utilisateur: CodeAwareUtilisateur) {
    utilisateur.failed_checkcode_count = 0;
  }

  private static random6Digit(): string {
    return '' + crypto.randomInt(100000, 999999);
  }

  private static incrementNextAllowedCodeTime(
    utilisateur: CodeAwareUtilisateur,
  ) {
    if (utilisateur.prevent_checkcode_before.getTime() <= Date.now()) {
      utilisateur.prevent_checkcode_before = new Date();
    }
    utilisateur.prevent_checkcode_before.setMinutes(
      utilisateur.prevent_checkcode_before.getMinutes() +
        CodeManager.BLOCKED_CODE_DURATION_MIN,
    );
  }
}
