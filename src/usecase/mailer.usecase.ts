import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { EmailSender } from '../infrastructure/email/emailSender';
import {
  CanalNotification,
  TypeNotification,
} from '../domain/notification/notificationHistory';
import { EmailTemplateRepository } from '../infrastructure/email/emailTemplate.repository';
import { Utilisateur } from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
var crypto = require('crypto');

const day_2 = 1000 * 60 * 60 * 24 * 2;

@Injectable()
export class MailerUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private emailTemplateRepository: EmailTemplateRepository,
    private emailSender: EmailSender,
  ) {}

  async disableUserEmails(token: string) {
    if (!token || token.length < 20) {
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
        new Date(Date.now() - day_2),
      );

    for (const utilisateurId of listeUtilisateursIds) {
      const utilisateur = await this.utilisateurRepository.getById(
        utilisateurId,
      );

      if (utilisateur.notification_history.isWelcomeEmailToSend(utilisateur)) {
        const USER_UNSUBSCRIBE_TOKEN = crypto.randomUUID();

        const is_sent_email = await this.sendEmailOfType(
          TypeNotification.welcome,
          utilisateur,
          USER_UNSUBSCRIBE_TOKEN,
        );

        if (is_sent_email) {
          utilisateur.unsubscribe_mail_token = USER_UNSUBSCRIBE_TOKEN;
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
      const USER_UNSUBSCRIBE_TOKEN = crypto.randomUUID();

      for (const notif_type of notif_type_liste) {
        const is_sent_email = await this.sendEmailOfType(
          notif_type,
          utilisateur,
          USER_UNSUBSCRIBE_TOKEN,
        );

        if (is_sent_email) {
          liste_sent_notifs.push(notif_type);
          utilisateur.unsubscribe_mail_token = USER_UNSUBSCRIBE_TOKEN;
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

  private async sendEmailOfType(
    type_notif: TypeNotification,
    utilisateur: Utilisateur,
    unsubscribe_token: string,
  ): Promise<boolean> {
    const email = this.emailTemplateRepository.generateEmailByType(
      type_notif,
      utilisateur,
      unsubscribe_token,
    );
    if (email) {
      await this.emailSender.sendEmail(
        utilisateur.email,
        utilisateur.prenom,
        email.body,
        email.subject,
      );

      utilisateur.notification_history.declareSentNotification(
        type_notif,
        CanalNotification.email,
      );
      return true;
    }
    return false;
  }
}
