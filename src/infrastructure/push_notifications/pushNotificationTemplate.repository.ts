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
    return null;
  }
}
