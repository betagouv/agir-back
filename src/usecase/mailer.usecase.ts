import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { EmailSender } from '../infrastructure/email/emailSender';
import { CanalNotification } from '../domain/notification/notificationHistory';

@Injectable()
export class MailerUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private emailSender: EmailSender,
  ) {}

  async envoieMaisAutomatiques(): Promise<string[]> {
    const listeUtilisateursIds =
      await this.utilisateurRepository.listUtilisateurIds();

    let result: string[] = [];

    for (const utilisateurId of listeUtilisateursIds) {
      const utilisateur = await this.utilisateurRepository.getById(
        utilisateurId,
      );

      const notifs = utilisateur.notification_history.getNouvellesNotifications(
        CanalNotification.email,
      );

      result = result.concat(notifs);
    }

    return result;
  }
}
