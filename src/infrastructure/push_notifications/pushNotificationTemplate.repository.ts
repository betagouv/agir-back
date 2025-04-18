import { Injectable } from '@nestjs/common';
import { MobileNotification } from '../../domain/notification/notificationHistory';
import { PushNotificationMessage } from '../../domain/notification/pushNotificationMessage';
import { Utilisateur } from '../../domain/utilisateur/utilisateur';

@Injectable()
export class PushNotificationTemplateRepository {
  public generateUserPushNotificationByType(
    type: MobileNotification,
    utilisateur: Utilisateur,
  ): PushNotificationMessage | null {
    switch (type) {
      case MobileNotification.mobile_inscription_J2:
        return new PushNotificationMessage({
          title: 'Bienvenue sur J’agis ! 🌱',
          body: 'Découvrez les actions près de chez vous',
          image_url: null,
          data: {},
          token: utilisateur.mobile_token,
        });

      case MobileNotification.mobile_inscription_J9:
        return new PushNotificationMessage({
          title: 'Prêt(e) à passer à l’action ? 🔥',
          body: 'Découvrez les actions de la semaine sur J’agis',
          image_url: null,
          data: {},
          token: utilisateur.mobile_token,
        });

      default:
        return null;
    }
  }
}
