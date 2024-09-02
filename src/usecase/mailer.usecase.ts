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

  async envoyerMaisAutomatiques(): Promise<string[]> {
    const listeUtilisateursIds =
      await this.utilisateurRepository.listUtilisateurIds();

    let result: string[] = [];

    for (const utilisateurId of listeUtilisateursIds) {
      const utilisateur = await this.utilisateurRepository.getById(
        utilisateurId,
      );

      const notifs = utilisateur.notification_history.getNouvellesNotifications(
        CanalNotification.email,
        utilisateur,
      );

      for (const notif of notifs) {
        const email = this.emailTemplateRepository.generateEmailByType(
          notif,
          utilisateur,
        );
        if (email) {
          this.emailSender.sendEmail(
            utilisateur.email,
            utilisateur.prenom,
            email.body,
            email.subject,
          );
        }
      }
      result = result.concat(notifs);
    }

    return result;
  }
}
