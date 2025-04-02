import { Injectable } from '@nestjs/common';
import { EmailScheduler } from '../domain/notification/emailScheduler';
import {
  CanalNotification,
  EmailNotification,
  TypeNotification,
} from '../domain/notification/notificationHistory';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
import { EmailSender } from '../infrastructure/email/emailSender';
import { EmailTemplateRepository } from '../infrastructure/email/emailTemplate.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';

const day_10 = 1000 * 60 * 60 * 24 * 10;

@Injectable()
export class NotificationEmailUsecase {
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
      await this.utilisateurRepository.listUtilisateurIds({
        created_after: new Date(Date.now() - day_10),
        is_active: true,
      });

    for (const utilisateurId of listeUtilisateursIds) {
      const utilisateur = await this.utilisateurRepository.getById(
        utilisateurId,
        [Scope.notification_history, Scope.thematique_history],
      );

      if (
        EmailScheduler.estNotificationEligible(
          EmailNotification.welcome,
          utilisateur,
        )
      ) {
        utilisateur.setUnsubscribeEmailTokenIfMissing();

        const is_sent_email = await this.external_send_user_email_of_type(
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

  async envoyerEmailsAutomatiques(block_size: number = 100): Promise<string[]> {
    const result: string[] = [];

    const total_user_count = await this.utilisateurRepository.countAll();

    for (let index = 0; index < total_user_count; index = index + block_size) {
      const current_user_list =
        await this.utilisateurRepository.listePaginatedUsers(
          index,
          block_size,
          [Scope.notification_history, Scope.thematique_history],
          { is_active: true },
        );

      for (const utilisateur of current_user_list) {
        if (
          !utilisateur.notification_history.isCanalEnabled(
            CanalNotification.email,
          )
        ) {
          continue;
        }

        const notif_type_liste =
          utilisateur.notification_history.getNouvellesNotificationsEmailAPousser(
            utilisateur,
          );

        const liste_sent_notifs: string[] = [];

        for (const notif_type of notif_type_liste) {
          utilisateur.setUnsubscribeEmailTokenIfMissing();

          const is_sent_email = await this.external_send_user_email_of_type(
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
    }

    return result;
  }

  public async sendAllMailsToUserAsTest(
    utilisateurId: string,
  ): Promise<string[]> {
    let result = [];
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.ALL],
    );

    for (const type of Object.values(TypeNotification)) {
      await this.sendTestEmailOfType(type, utilisateur);
      result.push(type);
    }

    return result;
  }

  public async sendOneMailToUserAsTest(
    utilisateurId: string,
    type: string,
  ): Promise<string[]> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.ALL],
    );

    await this.sendTestEmailOfType(TypeNotification[type], utilisateur);

    return [type];
  }

  public async external_send_user_email_of_type(
    type_notif: TypeNotification,
    utilisateur: Utilisateur,
    update_history: boolean = true,
  ): Promise<boolean> {
    const email = this.emailTemplateRepository.generateUserEmailByType(
      type_notif,
      utilisateur,
      utilisateur.unsubscribe_mail_token,
    );

    if (email) {
      const sent_email = await this.emailSender.sendEmail(
        utilisateur.email,
        utilisateur.pseudo,
        email.body,
        email.subject,
      );
      if (update_history && utilisateur.notification_history && sent_email) {
        utilisateur.notification_history.declareSentNotification(
          type_notif,
          CanalNotification.email,
        );
        return true;
      }
    }
    return false;
  }

  public async external_send_anonymous_email_of_type(
    type_notif: TypeNotification,
    target_email: string,
  ): Promise<boolean> {
    const email =
      this.emailTemplateRepository.generateAnonymousEmailByType(type_notif);

    if (email) {
      const sent_email = await this.emailSender.sendEmail(
        target_email,
        '',
        email.body,
        email.subject,
      );
      return sent_email;
    }
    return false;
  }

  private async sendTestEmailOfType(
    type: TypeNotification,
    utilisateur: Utilisateur,
  ) {
    await this.external_send_user_email_of_type(type, utilisateur, false);
  }
}
