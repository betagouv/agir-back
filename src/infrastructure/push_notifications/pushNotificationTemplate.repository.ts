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
          title: 'Vos premiers pas avec J’agis 🌱',
          body: "Découvrez l'application mobile et prenez vos première actions !",
          image_url: null,
          data: {},
          token: utilisateur.mobile_token,
        });

      default:
        return null;
    }
  }
}
