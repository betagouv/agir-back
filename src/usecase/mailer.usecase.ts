import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { EmailSender } from '../infrastructure/email/emailSender';
import { CanalNotification } from '../domain/notification/notificationHistory';
import { EmailTemplateRepository } from '../infrastructure/email/emailTemplate.repository';

@Injectable()
export class MailerUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private emailTemplateRepository: EmailTemplateRepository,
    private emailSender: EmailSender,
  ) {}

  async envoyerEmailsAutomatiques(): Promise<string[]> {
    const listeUtilisateursIds =
      await this.utilisateurRepository.listUtilisateurIds();

    let result: string[] = [];

    for (const utilisateurId of listeUtilisateursIds) {
      const utilisateur = await this.utilisateurRepository.getById(
        utilisateurId,
      );

      const notifs =
        utilisateur.notification_history.getNouvellesNotificationsAPousser(
          CanalNotification.email,
          utilisateur,
        );

      console.log(notifs);

      for (const notif of notifs) {
        const email = this.emailTemplateRepository.generateEmailByType(
          notif,
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
            notif,
            CanalNotification.email,
          );
        }
      }

      await this.utilisateurRepository.updateUtilisateur(utilisateur);

      result = result.concat(notifs);
    }

    return result;
  }
}
