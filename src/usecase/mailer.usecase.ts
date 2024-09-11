import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { EmailSender } from '../infrastructure/email/emailSender';
import {
  CanalNotification,
  TypeNotification,
} from '../domain/notification/notificationHistory';
import { EmailTemplateRepository } from '../infrastructure/email/emailTemplate.repository';
import { Utilisateur } from '../domain/utilisateur/utilisateur';

const day_2 = 1000 * 60 * 60 * 24 * 2;

@Injectable()
export class MailerUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private emailTemplateRepository: EmailTemplateRepository,
    private emailSender: EmailSender,
  ) {}

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
      );

      const notif_type_liste =
        utilisateur.notification_history.getNouvellesNotificationsAPousser(
          CanalNotification.email,
          utilisateur,
        );

      const liste_sent_notifs: string[] = [];
      for (const notif_type of notif_type_liste) {
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

  private async sendEmailOfType(
    type_notif: TypeNotification,
    utilisateur: Utilisateur,
  ): Promise<boolean> {
    const email = this.emailTemplateRepository.generateEmailByType(
      type_notif,
      utilisateur,
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
