import { Injectable } from '@nestjs/common';
import {
  CanalNotification,
  MobileNotification,
} from '../domain/notification/notificationHistory';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { PushNotificationTemplateRepository } from '../infrastructure/push_notifications/pushNotificationTemplate.repository';
import { PushNotificator } from '../infrastructure/push_notifications/pushNotificator';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';

const day_10 = 1000 * 60 * 60 * 24 * 10;

@Injectable()
export class NotificationMobileUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private pushNotificationTemplateRepository: PushNotificationTemplateRepository,
    private pushNotificator: PushNotificator,
  ) {}

  async envoyerNotificationsMobileAutomatiques(
    block_size: number = 50,
  ): Promise<string[]> {
    const result: string[] = [];

    const total_user_count = await this.utilisateurRepository.countAll();

    for (let index = 0; index < total_user_count; index = index + block_size) {
      const current_user_list =
        await this.utilisateurRepository.listePaginatedUsers(
          index,
          block_size,
          [Scope.notification_history, Scope.defis],
          { is_active: true, has_mobile_push_notif_token: true },
        );

      for (const utilisateur of current_user_list) {
        if (
          utilisateur.notification_history.isCanalDisabled(
            CanalNotification.mobile,
          )
        ) {
          continue;
        }

        const notif_type_liste =
          utilisateur.notification_history.getNouvellesNotificationsMobileAPousser(
            utilisateur,
          );

        const liste_sent_notifs: string[] = [];

        for (const notif_type of notif_type_liste) {
          const is_sent_notif = await this.external_send_user_pushnotif_of_type(
            notif_type,
            utilisateur,
          );

          if (is_sent_notif) {
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

  public async external_send_user_pushnotif_of_type(
    type_notif: MobileNotification,
    utilisateur: Utilisateur,
    update_history: boolean = true,
  ): Promise<boolean> {
    const message =
      this.pushNotificationTemplateRepository.generateUserPushNotificationByType(
        type_notif,
        utilisateur,
      );

    if (message) {
      const sent_message = await this.pushNotificator.pushMessage(message);
      if (update_history && utilisateur.notification_history && sent_message) {
        utilisateur.notification_history.declareSentNotification(
          type_notif,
          CanalNotification.mobile,
        );
        return true;
      }
    }
    return false;
  }
}
