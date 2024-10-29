import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { EmailSender } from '../infrastructure/email/emailSender';
import {
  CanalNotification,
  TypeNotification,
} from '../domain/notification/notificationHistory';
import { EmailTemplateRepository } from '../infrastructure/email/emailTemplate.repository';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';

const day_15 = 1000 * 60 * 60 * 24 * 15;

@Injectable()
export class MailerUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private emailTemplateRepository: EmailTemplateRepository,
    private emailSender: EmailSender,
  ) {}

  async disableUserEmails(token: string) {
    if (!token || token.length < 8) {
      ApplicationError.throwBadTokenError(token);
    }

    const utilisateur = await this.utilisateurRepository.getByEmailToken(token);

    if (utilisateur) {
      utilisateur.notification_history.disableCanal(CanalNotification.email);
      await this.utilisateurRepository.updateUtilisateur(utilisateur);
    } else {
      ApplicationError.throwBadTokenError(token);
    }
  }

  async envoyerEmailsWelcome(): Promise<string[]> {
    const result: string[] = [];
    const listeUtilisateursIds =
      await this.utilisateurRepository.listUtilisateurIds(
        new Date(Date.now() - day_15),
        true,
      );

    for (const utilisateurId of listeUtilisateursIds) {
      const utilisateur = await this.utilisateurRepository.getById(
        utilisateurId,
        [Scope.notification_history],
      );

      if (utilisateur.notification_history.isWelcomeEmailToSend(utilisateur)) {
        utilisateur.setUnsubscribeEmailTokenIfMissing();

        const is_sent_email = await this.sendEmailOfType(
          TypeNotification.welcome,
          utilisateur,
        );

        if (is_sent_email) {
          result.push(`Sent welcome email to [${utilisateur.id}]`);
          await this.utilisateurRepository.updateUtilisateur(utilisateur);
        }
      }
    }
    return result;
  }

  async envoyerEmailsAutomatiques(): Promise<string[]> {
    const result: string[] = [];
    const listeUtilisateursIds =
      await this.utilisateurRepository.listUtilisateurIds();

    for (const utilisateurId of listeUtilisateursIds) {
      const utilisateur = await this.utilisateurRepository.getById(
        utilisateurId,
        [Scope.notification_history, Scope.todo, Scope.defis],
      );

      if (
        !utilisateur.notification_history.isCanalEnabled(
          CanalNotification.email,
        )
      ) {
        continue;
      }

      const notif_type_liste =
        utilisateur.notification_history.getNouvellesNotificationsAPousser(
          CanalNotification.email,
          utilisateur,
        );

      const liste_sent_notifs: string[] = [];

      for (const notif_type of notif_type_liste) {
        utilisateur.setUnsubscribeEmailTokenIfMissing();

        const is_sent_email = await this.sendEmailOfType(
          notif_type,
          utilisateur,
        );

        if (is_sent_email) {
          liste_sent_notifs.push(notif_type);
        }
      }

      await this.utilisateurRepository.updateUtilisateur(utilisateur);

      if (liste_sent_notifs.length > 0) {
        result.push(
          `Sent for [${utilisateur.id}] : [${liste_sent_notifs.toString()}]`,
        );
      }
    }

    return result;
  }

  public async sendAllMailsToUserAsTest(
    utilisateurId: string,
  ): Promise<string[]> {
    const result = [];
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.ALL],
    );

    for (const type of Object.values(TypeNotification)) {
      await this.sendTestEmailOfType(type, utilisateur, result);
    }

    return result;
  }

  private async sendTestEmailOfType(
    type: TypeNotification,
    utilisateur: Utilisateur,
    log: string[],
  ) {
    if (await this.sendEmailOfType(type, utilisateur, false)) {
      log.push(type);
    }
  }

  public async sendEmailOfType(
    type_notif: TypeNotification,
    utilisateur: Utilisateur,
    update_history: boolean = true,
  ): Promise<boolean> {
    const email = this.emailTemplateRepository.generateEmailByType(
      type_notif,
      utilisateur,
      utilisateur.unsubscribe_mail_token,
    );

    if (email) {
      await this.emailSender.sendEmail(
        utilisateur.email,
        utilisateur.prenom,
        email.body,
        email.subject,
      );
      if (update_history && utilisateur.notification_history) {
        utilisateur.notification_history.declareSentNotification(
          type_notif,
          CanalNotification.email,
        );
      }
      return true;
    }
    return false;
  }
}
