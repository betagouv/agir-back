import { Injectable } from '@nestjs/common';
import { response } from 'express';
import { UtilisateurSecurityRepository } from '../../../infrastructure/repository/utilisateur/utilisateurSecurity.repository';
import { CodeAwareUtilisateur } from './codeAwareUtilisateur';

const MAUVAIS_CODE_ERROR = `Mauvais code ou adresse électronique`;

@Injectable()
export class CodeManager {
  constructor(private securityRepository: UtilisateurSecurityRepository) {}

  private static MAX_CODE_ATTEMPT = 3;
  private static BLOCKED_CODE_DURATION_MIN = 5;

  public static setNew6DigitCode(utilisateur: CodeAwareUtilisateur) {
    utilisateur.code = Math.floor(100000 + Math.random() * 900000).toString();
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
      CodeManager.checkCodeLocked(utilisateur);
      throw new Error(MAUVAIS_CODE_ERROR);
    }
  }

  private async checkCodeOKAndUpdateStates(
    utilisateur: CodeAwareUtilisateur,
    code: string,
  ): Promise<boolean> {
    const ok = utilisateur.code === code;
    if (!ok) {
      CodeManager.failCode(utilisateur);
      await this.securityRepository.updateCodeValidationData(utilisateur);
    } else {
      CodeManager.successCode(utilisateur);
      await this.securityRepository.updateCodeValidationData(utilisateur);
    }
    return ok;
  }

  private static checkCodeLocked(utilisateur: CodeAwareUtilisateur) {
    const isLocked =
      Date.now() < utilisateur.prevent_checkcode_before.getTime();

    if (isLocked) {
      throw new Error(
        `Trop d'essais successifs, attendez jusqu'à ${CodeManager.lockedUntilString(
          utilisateur,
        )} pour réessayer`,
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
