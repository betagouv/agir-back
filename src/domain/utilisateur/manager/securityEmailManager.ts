import { Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../../src/infrastructure/applicationError';
import { UtilisateurSecurityRepository } from '../../../infrastructure/repository/utilisateur/utilisateurSecurity.repository';
import { SecurityEmailAwareUtilisateur } from './securityEmailAwareUtilisateur';

const MAX_CODE_EMAIL_ATTEMPT = 4;
const BLOCKED_CODE_EMAIL_DURATION_MIN = 5;

@Injectable()
export class SecurityEmailManager {
  constructor(private securityRepository: UtilisateurSecurityRepository) {}

  public async attemptSecurityEmailEmission(
    utilisateur: SecurityEmailAwareUtilisateur,
    okAction: Function,
  ): Promise<any> {
    SecurityEmailManager.checkEmailLocked(utilisateur);

    SecurityEmailManager.resetEmailCouterIfNeeded(utilisateur);

    SecurityEmailManager.incrementEmailCount(utilisateur);

    await this.securityRepository.updateSecurityEmailEmissionData(utilisateur);

    SecurityEmailManager.checkEmailLocked(utilisateur);

    return okAction();
  }

  public async resetEmailSendingState(
    utilisateur: SecurityEmailAwareUtilisateur,
  ) {
    utilisateur.sent_email_count = 0;
    utilisateur.prevent_sendemail_before = new Date();
    await this.securityRepository.updateSecurityEmailEmissionData(utilisateur);
  }

  private static checkEmailLocked(utilisateur: SecurityEmailAwareUtilisateur) {
    if (SecurityEmailManager.isEmailLocked(utilisateur)) {
      ApplicationError.throwTropEssaisCode(
        SecurityEmailManager.lockedUntilString(utilisateur),
      );
    }
  }
  private static isEmailLocked(
    utilisateur: SecurityEmailAwareUtilisateur,
  ): boolean {
    return Date.now() < utilisateur.prevent_sendemail_before.getTime();
  }

  public static resetEmailCouterIfNeeded(
    utilisateur: SecurityEmailAwareUtilisateur,
  ) {
    if (
      utilisateur.sent_email_count > MAX_CODE_EMAIL_ATTEMPT &&
      utilisateur.prevent_sendemail_before.getTime() < Date.now()
    ) {
      utilisateur.sent_email_count = 0;
    }
  }

  public static incrementEmailCount(
    utilisateur: SecurityEmailAwareUtilisateur,
  ) {
    utilisateur.sent_email_count++;
    if (utilisateur.sent_email_count >= MAX_CODE_EMAIL_ATTEMPT) {
      utilisateur.prevent_sendemail_before.setMinutes(
        utilisateur.prevent_sendemail_before.getMinutes() +
          BLOCKED_CODE_EMAIL_DURATION_MIN,
      );
    }
  }
  private static lockedUntilString(
    utilisateur: SecurityEmailAwareUtilisateur,
  ): string {
    return utilisateur.prevent_sendemail_before.toLocaleTimeString('fr-FR', {
      timeZone: 'Europe/Paris',
      timeStyle: 'short',
      hour12: false,
    });
  }
}
